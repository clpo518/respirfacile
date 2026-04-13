import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Lightbulb, ArrowRight, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Exercise } from "@/data/exercises";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import BiofeedbackBar from "@/components/practice/BiofeedbackBar";
import SessionResultModal from "@/components/practice/SessionResultModal";
import { supabase } from "@/integrations/supabase/client";
import { createCompatibleRecorder, createAudioBlob, getRecordingFileName } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { wpmToSps, spsToWpm } from "@/lib/spsUtils";
import { getNormSPS } from "@/lib/ageNormsUtils";
import { useGamification } from "@/hooks/useGamification";
import { useVolumeAnalyzer } from "@/hooks/useVolumeAnalyzer";

const LATENCY_MIN = 2;   // Minimum pause expected (seconds)
const LATENCY_MAX = 5;   // Beyond this, considered too long / detection issue
const LATENCY_TARGET = 3; // Ideal pause duration

interface LatencyPlayerProps {
  exercise: Exercise;
  onBack: () => void;
}

type Phase = "intro" | "active" | "result";

interface PromptItem {
  question: string;
}

interface SpsDataPoint {
  timestamp: number;
  sps: number;
}

const LatencyPlayer = ({ exercise }: LatencyPlayerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const deepgram = useDeepgramSPS();
  const volume = useVolumeAnalyzer();
  const gamification = useGamification();

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [targetSPS, setTargetSPS] = useState(4.0);

  // SPS history for compliance bar
  const [sessionSpsHistory, setSessionSpsHistory] = useState<SpsDataPoint[]>([]);
  const lastSampledVersionRef = useRef(0);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [streakIncremented, setStreakIncremented] = useState(false);
  const [goalJustCompleted, setGoalJustCompleted] = useState(false);

  // Latency tracking per question
  const [latencyTimes, setLatencyTimes] = useState<number[]>([]); // seconds waited before speaking per question
  const [currentLatency, setCurrentLatency] = useState<number | null>(null); // latency for current question (null = not spoken yet)
  const [latencyWarning, setLatencyWarning] = useState<string | null>(null);
  const questionStartRef = useRef<number | null>(null);
  const speechDetectedRef = useRef(false); // has speech been detected for current question?

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const spsPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Parse prompts from exercise text
  const prompts: PromptItem[] = exercise.text
    .split(/\n+/)
    .filter(line => line.trim())
    .map(line => ({ question: line.replace(/^\d+[.)]\s*/, "").trim() }));

  const currentPrompt = prompts[currentPromptIndex];

  // Fetch target SPS
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_year, target_wpm").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.target_wpm) setTargetSPS(Math.round(wpmToSps(data.target_wpm)));
      else if (data?.birth_year) setTargetSPS(Math.round(getNormSPS(data.birth_year)));
    });
  }, [user]);

  // SPS history polling (sample every 500ms when active)
  useEffect(() => {
    if (phase === "active") {
      spsPollingRef.current = setInterval(() => {
        if (deepgram.packetVersion > lastSampledVersionRef.current) {
          lastSampledVersionRef.current = deepgram.packetVersion;
          const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
          setSessionSpsHistory(prev => [...prev, { timestamp: elapsed, sps: deepgram.packetSPS }]);
        }
      }, 500);
      return () => { if (spsPollingRef.current) clearInterval(spsPollingRef.current); };
    }
  }, [phase, deepgram.packetVersion, deepgram.packetSPS]);

  // Detect first speech for current question to measure latency
  useEffect(() => {
    if (phase === "active" && volume.isSpeaking && !speechDetectedRef.current && questionStartRef.current) {
      speechDetectedRef.current = true;
      const waited = (Date.now() - questionStartRef.current) / 1000;
      const roundedWait = Math.round(waited * 10) / 10;
      // Cap to LATENCY_MAX to avoid absurd values (detection miss)
      const cappedWait = Math.min(roundedWait, LATENCY_MAX);
      setCurrentLatency(cappedWait);
      
      if (cappedWait < LATENCY_MIN) {
        setLatencyWarning(`⚡ Trop vite ! Vous avez parlé après ${cappedWait}s — imposez-vous au moins ${LATENCY_MIN}s de pause`);
      } else if (cappedWait >= LATENCY_MIN && cappedWait < LATENCY_TARGET) {
        setLatencyWarning(`⚠️ Presque ! ${cappedWait}s de pause — visez ${LATENCY_TARGET}s pour un meilleur contrôle`);
      } else {
        setLatencyWarning(null);
      }
    }
  }, [phase, volume.isSpeaking]);

  const beginQuestion = useCallback(() => {
    questionStartRef.current = Date.now();
    speechDetectedRef.current = false;
    setCurrentLatency(null);
    setLatencyWarning(null);
  }, []);

  const startSession = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      streamRef.current = stream;

      try {
        await deepgram.start(stream, { detectFillers: true });
      } catch {
        toast.info("Enregistrement sans transcription temps réel.", { duration: 3000 });
      }

      const mediaRecorder = createCompatibleRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      const isMp4 = mediaRecorder.mimeType?.includes("mp4") || mediaRecorder.mimeType?.includes("aac");
      mediaRecorder.start(isMp4 ? undefined : 1000);

      startTimeRef.current = Date.now();
      setSessionSpsHistory([{ timestamp: 0, sps: 0 }]);
      setLatencyTimes([]);
      lastSampledVersionRef.current = 0;

      // Start volume analyzer for speech detection
      volume.startAnalyzing(stream);

      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setTotalElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      setPhase("active");
      // Start first question timing
      questionStartRef.current = Date.now();
      speechDetectedRef.current = false;
      setCurrentLatency(null);
      setLatencyWarning(null);
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepgram]);

  const recordCurrentLatency = useCallback(() => {
    // Record latency for the current question
    if (currentLatency !== null) {
      setLatencyTimes(prev => [...prev, currentLatency]);
    } else {
      // Patient never spoke — record as max (they stayed silent)
      const waited = questionStartRef.current ? (Date.now() - questionStartRef.current) / 1000 : LATENCY_TARGET;
      setLatencyTimes(prev => [...prev, Math.round(waited * 10) / 10]);
    }
  }, [currentLatency]);

  const finishSession = useCallback(async () => {
    // Record last question's latency
    recordCurrentLatency();

    if (timerRef.current) clearInterval(timerRef.current);
    if (spsPollingRef.current) clearInterval(spsPollingRef.current);
    deepgram.stop();
    volume.stopAnalyzing();
    mediaRecorderRef.current?.stop();
    await new Promise(r => setTimeout(r, 500));
    streamRef.current?.getTracks().forEach(t => t.stop());

    // Calculate stats
    const spsValues = sessionSpsHistory.map(p => p.sps);
    const validSps = spsValues.filter(s => s >= 1.0);
    const realAvgSps = validSps.length > 0
      ? Math.round((validSps.reduce((a, b) => a + b, 0) / validSps.length) * 10) / 10
      : deepgram.currentSPS;

    // Gamification
    let streakInc = false;
    let goalDone = false;
    if (user) {
      const result = await gamification.updateAfterSession(totalElapsed);
      streakInc = result.streakIncremented;
      goalDone = result.goalJustCompleted;
    }
    setStreakIncremented(streakInc);
    setGoalJustCompleted(goalDone);

    if (user) {
      const audioBlob = createAudioBlob(audioChunksRef.current);
      let fileName: string | null = null;
      if (audioBlob.size > 0) {
        fileName = getRecordingFileName(user.id);
        await supabase.storage.from("recordings").upload(fileName, audioBlob).catch(() => { fileName = null; });
      }

      const wpmData = sessionSpsHistory.map((point) => ({
        timestamp: point.timestamp,
        wpm: spsToWpm(point.sps),
      }));

      // Build latency stats to persist in notes as JSON
      const finalLatencies = [...latencyTimes];
      if (currentLatency !== null) finalLatencies.push(currentLatency);
      const latencyData = {
        type: "latency_stats",
        latencyTimes: finalLatencies,
        pausesRespected: finalLatencies.filter(t => t >= 2).length,
        totalQuestions: finalLatencies.length,
      };

      const { data: sessionData, error: insertError } = await supabase.from("sessions").insert([{
        user_id: user.id,
        duration_seconds: totalElapsed,
        avg_wpm: Math.round(spsToWpm(realAvgSps)),
        max_wpm: 0,
        target_wpm: Math.round(spsToWpm(targetSPS)),
        recording_url: fileName,
        exercise_type: "latence",
        word_timestamps: deepgram.getWordTimestamps() as unknown as ReturnType<typeof JSON.parse>,
        wpm_data: wpmData as unknown as ReturnType<typeof JSON.parse>,
        notes: JSON.stringify(latencyData),
      }]).select("id").maybeSingle();

      if (insertError) console.error("Session save error:", insertError);
      if (sessionData?.id) setSessionId(sessionData.id);
    }

    setPhase("result");
    setShowResultModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepgram, user, totalElapsed, sessionSpsHistory, targetSPS, gamification, recordCurrentLatency]);

  const nextPrompt = useCallback(() => {
    // Record latency for current question before moving on
    recordCurrentLatency();

    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
      beginQuestion();
    } else {
      finishSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex, prompts.length, beginQuestion, finishSession, recordCurrentLatency]);

  const handleRetry = useCallback(() => {
    deepgram.reset();
    setPhase("intro");
    setCurrentPromptIndex(0);
    setTotalElapsed(0);
    setSessionSpsHistory([]);
    setLatencyTimes([]);
    setShowResultModal(false);
    setSessionId(undefined);
    lastSampledVersionRef.current = 0;
  }, [deepgram]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Compute avg SPS for the result modal
  const spsValues = sessionSpsHistory.map(p => p.sps).filter(s => s >= 1.0);
  const avgSps = spsValues.length > 0
    ? Math.round((spsValues.reduce((a, b) => a + b, 0) / spsValues.length) * 10) / 10
    : deepgram.currentSPS;

  const wpmDataForModal = sessionSpsHistory.map(p => ({ timestamp: p.timestamp, wpm: spsToWpm(p.sps) }));

  // Latency compliance for bilan — include already-recorded + current question
  const allLatencies = currentLatency !== null
    ? [...latencyTimes, currentLatency]
    : latencyTimes;
  const pausesRespected = allLatencies.filter(t => t >= LATENCY_MIN).length;
  const latencyStatsForModal = allLatencies.length > 0 ? {
    totalQuestions: allLatencies.length,
    pausesRespected,
    latencyTimes: allLatencies,
  } : undefined;

  // Live latency status for current question
  const showLatencySuccess = currentLatency !== null && currentLatency >= LATENCY_MIN;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Intro */}
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 px-6 py-8 text-center">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ⏱️
                  </motion.div>
                  <h3 className="text-lg font-bold mb-1">Prenez votre temps</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Une question apparaît — <strong>imposez-vous {LATENCY_MIN} à {LATENCY_MAX} secondes de silence</strong> avant de répondre. On mesure si vous y arrivez !
                  </p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {/* Target SPS selector */}
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs text-muted-foreground">Vitesse cible</span>
                    <div className="flex items-center gap-2 bg-muted rounded-full px-1 py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setTargetSPS(prev => Math.max(2, prev - 0.5))}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-sm font-semibold tabular-nums w-16 text-center">
                        {targetSPS.toFixed(1)} syll/s
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setTargetSPS(prev => Math.min(8, prev + 0.5))}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button onClick={startSession} size="lg" className="gap-2 rounded-xl h-12 px-6">
                      <Mic className="w-5 h-5" /> C'est parti
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      {prompts.length} questions • ~{Math.ceil(prompts.length * 0.75)} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-3 p-3 rounded-xl bg-muted/50 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{exercise.tip}</p>
            </div>
          </motion.div>
        )}

        {/* Active — question + speed gauge + latency detection */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {currentPromptIndex + 1} / {prompts.length}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(totalElapsed)}</span>
                </div>

                <motion.p
                  key={currentPromptIndex}
                  className="text-center text-lg font-medium leading-relaxed mb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentPrompt?.question}
                </motion.p>

                {/* Latency feedback */}
                <AnimatePresence mode="wait">
                  {latencyWarning && (
                    <motion.div
                      key="warning"
                      className="mb-3 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-center"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs text-destructive font-medium">{latencyWarning}</p>
                    </motion.div>
                  )}
                  {showLatencySuccess && (
                    <motion.div
                      key="success"
                      className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✅ Bravo ! Pause de {currentLatency}s respectée
                      </p>
                    </motion.div>
                  )}
                  {currentLatency === null && (
                    <motion.p
                      key="hint"
                      className="text-xs text-center text-muted-foreground mb-3"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🤫 Attendez {LATENCY_MIN}-{LATENCY_MAX}s avant de parler…
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="text-center text-xs text-muted-foreground mb-5">
                  Répondez en 2-3 phrases, à votre rythme
                </p>

                {currentPromptIndex < prompts.length - 1 && (
                  <div className="flex justify-center">
                    <Button onClick={nextPrompt} size="lg" className="gap-2 rounded-xl">
                      Suivante <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Bottom padding for fixed BiofeedbackBar */}
                <div className="h-20" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom BiofeedbackBar — same as other exercises */}
      <AnimatePresence>
        {phase === "active" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <BiofeedbackBar
              sps={deepgram.packetSPS}
              targetSps={targetSPS}
              isRecording={true}
              isCalibrated={deepgram.isCalibrated}
              onStop={currentPromptIndex >= prompts.length - 1 ? finishSession : finishSession}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Result Modal */}
      <SessionResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        avgSps={avgSps}
        targetSps={targetSPS}
        syllableCount={deepgram.syllableCount}
        sessionId={sessionId}
        onContinue={() => sessionId ? navigate(`/session/${sessionId}`) : navigate("/library")}
        onRetry={handleRetry}
        actualSpeakingTime={deepgram.actualSpeakingTime}
        totalSessionTime={totalElapsed}
        streakIncremented={streakIncremented}
        goalJustCompleted={goalJustCompleted}
        currentStreak={gamification.currentStreak}
        todayMinutes={gamification.todayMinutes}
        dailyGoal={gamification.dailyGoal}
        goalProgress={gamification.goalProgress}
        wpmData={wpmDataForModal}
        exerciseId={exercise.id}
        latencyStats={latencyStatsForModal}
      />
    </div>
  );
};

export default LatencyPlayer;
