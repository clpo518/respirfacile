import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Mic, Square, RotateCcw, Lightbulb, Pause, Play, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Exercise } from "@/data/exercises";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import SpeedGaugeBar from "@/components/practice/SpeedGaugeBar";
import RetellingBilan, { RetellingAnalysis } from "@/components/practice/RetellingBilan";
import { supabase } from "@/integrations/supabase/client";
import { createCompatibleRecorder, createAudioBlob, getRecordingFileName } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { wpmToSps } from "@/lib/spsUtils";
import { getNormSPS } from "@/lib/ageNormsUtils";

type Phase = "listen" | "ready" | "retell" | "analyzing" | "bilan";

interface RetellingPlayerProps {
  exercise: Exercise;
  onBack: () => void;
}

const RetellingPlayer = ({ exercise, onBack }: RetellingPlayerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("listen");
  const [listenCount, setListenCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Deepgram (transcription + SPS tracking)
  const deepgram = useDeepgramSPS();

  // Target SPS for biofeedback
  const [targetSPS, setTargetSPS] = useState(4.0);

  // Bilan
  const [analysis, setAnalysis] = useState<RetellingAnalysis | null>(null);
  const [bilanLoading, setBilanLoading] = useState(false);
  const [bilanError, setBilanError] = useState<string | null>(null);
  const [recordingPublicUrl, setRecordingPublicUrl] = useState<string | null>(null);

  // Fetch user's target SPS from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_year, target_wpm").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.target_wpm) {
        setTargetSPS(Math.round(wpmToSps(data.target_wpm)));
      } else if (data?.birth_year) {
        setTargetSPS(Math.round(getNormSPS(data.birth_year)));
      }
    });
  }, [user]);

  // Ensure voices are loaded
  useEffect(() => {
    window.speechSynthesis.getVoices();
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      window.speechSynthesis.cancel();
    };
  }, []);

  /** Pick the best French voice */
  const getFrenchVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.filter(v => v.lang.startsWith("fr"));
    const preferred = fr.find(v => /google|microsoft|amelie|thomas/i.test(v.name));
    return preferred || fr[0] || null;
  }, []);

  /** Stop current speech */
  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  /** Toggle pause/resume */
  const togglePause = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  /** Phase 1: Read the story aloud via Web Speech API */
  const handleListen = useCallback(() => {
    if (listenCount >= 2) {
      toast.info("Nombre d'écoutes maximum atteint (2)");
      return;
    }
    if (isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(exercise.text);
    const voice = getFrenchVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setListenCount(prev => prev + 1);
      setPhase("ready");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      toast.error("Erreur de synthèse vocale");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [exercise.text, listenCount, isSpeaking, getFrenchVoice]);

  /** Phase 2: Start recording retelling */
  const startRetelling = useCallback(async () => {
    stopAudio(); // Make sure audio is stopped
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
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      setIsRecording(true);
      setPhase("retell");
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
  }, [deepgram, stopAudio]);

  /** Stop recording and get transcript */
  const stopRetelling = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    deepgram.stop();
    mediaRecorderRef.current?.stop();
    await new Promise(r => setTimeout(r, 500));
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsRecording(false);

    const words = deepgram.getWordTimestamps();
    const text = words.map(w => w.word).join(" ");
    setTranscript(text);

    // Save audio recording to storage
    let fileName: string | null = null;
    let savedSessionId: string | null = null;
    if (user) {
      const audioBlob = createAudioBlob(audioChunksRef.current);
      if (audioBlob.size > 0) {
        fileName = getRecordingFileName(user.id);
        const { error: uploadError } = await supabase.storage.from("recordings").upload(fileName, audioBlob);
        if (uploadError) {
          console.error("Audio upload error:", uploadError);
          fileName = null;
        } else {
          const { data: publicUrlData } = supabase.storage.from("recordings").getPublicUrl(fileName);
          setRecordingPublicUrl(publicUrlData.publicUrl);
        }
      }

      // Save session to DB for history & playback
      try {
        const avgSps = deepgram.currentSPS;
        const { data: insertedSession } = await supabase.from("sessions").insert([{
          user_id: user.id,
          duration_seconds: elapsedTime,
          avg_wpm: Math.round(avgSps * 60 / 1.8), // back-convert for storage
          max_wpm: 0,
          recording_url: fileName,
          exercise_type: "retelling",
          word_timestamps: words as unknown as ReturnType<typeof JSON.parse>,
        }]).select("id").single();
        savedSessionId = insertedSession?.id || null;
      } catch (e) {
        console.error("Session save error:", e);
      }
    }

    if (!text.trim()) {
      toast.error("Aucune parole détectée. Réessayez.");
      setPhase("ready");
      return;
    }

    setPhase("analyzing");
    setBilanLoading(true);
    setBilanError(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-retelling", {
        body: {
          transcript: text,
          keyPoints: exercise.keyPoints,
          originalText: exercise.text,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data as RetellingAnalysis);
      setPhase("bilan");

      // Persist analysis to session notes for later viewing
      if (savedSessionId) {
        try {
          await supabase.from("sessions").update({
            notes: JSON.stringify({ retelling_analysis: data }),
          }).eq("id", savedSessionId);
        } catch (e) {
          console.error("Failed to save retelling analysis:", e);
        }
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setBilanError(err?.message || "Erreur lors de l'analyse");
      setPhase("bilan");
    } finally {
      setBilanLoading(false);
    }
  }, [deepgram, exercise, user, elapsedTime]);

  const handleRetry = useCallback(() => {
    stopAudio();
    deepgram.reset();
    setPhase("listen");
    setListenCount(0);
    setTranscript("");
    setAnalysis(null);
    setBilanError(null);
    setElapsedTime(0);
    setRecordingPublicUrl(null);
  }, [deepgram, stopAudio]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex justify-center gap-2 text-xs">
        {(["listen", "retell", "bilan"] as const).map((p, i) => {
          const labels = ["1. Écouter", "2. Raconter", "3. Bilan"];
          const isCurrent = phase === p || (phase === "ready" && p === "listen") || (phase === "analyzing" && p === "bilan");
          const isDone = (p === "listen" && ["ready", "retell", "analyzing", "bilan"].includes(phase)) ||
                         (p === "retell" && ["analyzing", "bilan"].includes(phase));
          return (
            <div key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              isCurrent ? "bg-primary text-primary-foreground" :
              isDone ? "bg-primary/20 text-primary" :
              "bg-muted text-muted-foreground"
            }`}>
              <span>{labels[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Phase 1: Listen */}
      <AnimatePresence mode="wait">
        {(phase === "listen" || phase === "ready") && (
          <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="p-5">
                {phase === "listen" && (
                  <>
                    <div className="text-lg leading-relaxed font-serif mb-6 p-4 rounded-lg bg-muted/50">
                      {exercise.text}
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      {!isSpeaking ? (
                        <Button
                          onClick={handleListen}
                          disabled={listenCount >= 2}
                          size="lg"
                          className="gap-2"
                        >
                          <Volume2 className="w-5 h-5" />
                          Écouter l'histoire
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={togglePause}
                            size="lg"
                            variant="outline"
                            className="gap-2"
                          >
                            {isPaused ? (
                              <>
                                <Play className="w-5 h-5" />
                                Reprendre
                              </>
                            ) : (
                              <>
                                <Pause className="w-5 h-5" />
                                Pause
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              stopAudio();
                              setListenCount(prev => prev + 1);
                              setPhase("ready");
                            }}
                            size="lg"
                            variant="destructive"
                            className="gap-2"
                          >
                            <StopCircle className="w-5 h-5" />
                            Arrêter
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Écoute {listenCount}/2
                      </p>
                    </div>
                  </>
                )}

                {phase === "ready" && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="text-4xl mb-2">🎤</div>
                      <h3 className="text-lg font-bold">À vous de raconter !</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Restituez l'histoire de mémoire. Soyez concis et mentionnez les points importants.
                      </p>
                      <div className="flex justify-center gap-3">
                        {listenCount < 2 && (
                          <Button variant="outline" onClick={() => setPhase("listen")} className="gap-2">
                            <RotateCcw className="w-4 h-4" /> Réécouter
                          </Button>
                        )}
                        <Button onClick={startRetelling} size="lg" className="gap-2">
                          <Mic className="w-5 h-5" /> Je suis prêt à raconter
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tip */}
            <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-start gap-2">
              <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{exercise.tip}</p>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Retelling */}
        {phase === "retell" && (
          <motion.div key="retell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Racontez l'histoire de mémoire</p>
                  <div className="text-2xl font-mono font-bold tabular-nums">{formatTime(elapsedTime)}</div>
                </div>

                {/* SPS Biofeedback */}
                <div className="mb-4 max-w-sm mx-auto">
                  <SpeedGaugeBar sps={deepgram.packetSPS} targetSps={targetSPS} />
                </div>

                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-5"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="flex justify-center">
                  <Button
                    onClick={stopRetelling}
                    size="lg"
                    variant="destructive"
                    className="gap-2 h-14 px-6 rounded-xl"
                  >
                    <Square className="w-5 h-5" fill="currentColor" />
                    J'ai terminé
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Phase 3: Bilan */}
        {(phase === "analyzing" || phase === "bilan") && (
          <motion.div key="bilan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RetellingBilan
              analysis={analysis}
              loading={bilanLoading}
              error={bilanError}
              audioUrl={recordingPublicUrl}
              onRetry={handleRetry}
              onBackToLibrary={() => navigate("/library")}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RetellingPlayer;
