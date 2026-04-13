import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createCompatibleRecorder, createAudioBlob, getRecordingFileName } from "@/lib/audioCompat";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gauge, MessageCircle, Square, Play, Pause, FlaskConical, Users, HelpCircle, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { useGamification } from "@/hooks/useGamification";
import { calculateSafeMaxSPS, spsToWpm, wpmToSps, getSPSZone } from "@/lib/spsUtils";
import { getNormSPS, getAgeGroupLabel } from "@/lib/ageNormsUtils";
import SessionResultModal from "@/components/practice/SessionResultModal";
import { Badge } from "@/components/ui/badge";
import FillerPill from "@/components/practice/FillerPill";

type TargetSPS = 1.0 | 2.0 | 3.0 | 4.0 | 5.0 | 6.0 | 7.0 | 8.0 | 9.0;
type Duration = 30 | 60 | 120 | 180 | 300;

// ─── Themed Conversation Prompts ───
interface ThemeConfig {
  label: string;
  emoji: string;
  prompts: string[];
}

const DIALOGUE_THEMES: Record<string, ThemeConfig> = {
  quotidien: {
    label: "Quotidien",
    emoji: "☀️",
    prompts: [
      "Racontez votre journée d'hier.",
      "Que prenez-vous au petit-déjeuner habituellement ?",
      "Comment organisez-vous votre semaine ?",
      "Décrivez votre trajet pour venir ici.",
      "Quel est votre moment préféré de la journée ?",
      "Parlez de votre dernier repas en famille.",
      "Que faites-vous pour vous détendre le soir ?",
    ],
  },
  souvenirs: {
    label: "Souvenirs",
    emoji: "📸",
    prompts: [
      "Quel est votre meilleur souvenir d'enfance ?",
      "Racontez un moment où vous avez beaucoup ri.",
      "Parlez d'un anniversaire mémorable.",
      "Décrivez un voyage qui vous a marqué.",
      "Quel souvenir de Noël gardez-vous ?",
      "Racontez une rencontre marquante.",
      "Quel moment de fierté gardez-vous en mémoire ?",
    ],
  },
  loisirs: {
    label: "Loisirs",
    emoji: "🎮",
    prompts: [
      "Quel est votre hobby préféré ?",
      "Parlez d'un film ou d'une série que vous avez vu récemment.",
      "Quel livre recommanderiez-vous ?",
      "Pratiquez-vous un sport ?",
      "Décrivez votre dernier week-end.",
      "Qu'aimez-vous faire quand il pleut ?",
      "Si vous aviez une journée entière libre, que feriez-vous ?",
    ],
  },
  opinions: {
    label: "Opinions",
    emoji: "💡",
    prompts: [
      "Quel est le sujet d'actualité qui vous intéresse le plus ?",
      "Êtes-vous plutôt ville ou campagne ? Pourquoi ?",
      "Quel conseil donneriez-vous à quelqu'un de plus jeune ?",
      "Qu'est-ce qui vous rend optimiste pour l'avenir ?",
      "Si vous pouviez changer une chose dans le monde, ce serait quoi ?",
      "Quel est votre plus grand rêve ?",
      "Parlez d'une valeur importante pour vous.",
    ],
  },
  libre: {
    label: "Libre",
    emoji: "🎲",
    prompts: [],
  },
};

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 30, label: "30 sec" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
  { value: 300, label: "5 min" },
];

const SPS_LEVELS = [
  { sps: 1.0, label: "Ultra-lent", emoji: "🐌", shortDesc: "Phonétique" },
  { sps: 2.0, label: "Tortue", emoji: "🐢", shortDesc: "Dictée" },
  { sps: 3.0, label: "Lent", emoji: "🎯", shortDesc: "Posé" },
  { sps: 4.0, label: "Modéré", emoji: "💬", shortDesc: "Conversation" },
  { sps: 5.0, label: "Soutenu", emoji: "⚡", shortDesc: "Dynamique" },
  { sps: 6.0, label: "Vitesse haute", emoji: "🔷", shortDesc: "Vitesse haute" },
  { sps: 7.0, label: "Dynamique", emoji: "💨", shortDesc: "Rapide" },
  { sps: 8.0, label: "Très rapide", emoji: "🔶", shortDesc: "Très rapide" },
  { sps: 9.0, label: "Maximum", emoji: "🚀", shortDesc: "Maximum" },
];

const FEEDBACK_DEBOUNCE_MS = 1000;
const MIN_SPEAKING_SPS = 0.3;

const Dialogue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const deepgram = useDeepgramSPS();
  const gamification = useGamification();
  const [showIntro, setShowIntro] = useState(false);

  const [targetSPS, setTargetSPS] = useState<TargetSPS>(4.0);
  const [duration, setDuration] = useState<Duration>(60);
  const [speakerCount, setSpeakerCount] = useState<number>(0); // 0 = auto
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);

  // Themed prompts
  const [themeKey, setThemeKey] = useState<string>("quotidien");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const promptIndexRef = useRef(0);

  const [sessionSpsHistory, setSessionSpsHistory] = useState<{timestamp: number; sps: number}[]>([]);

  const [userBirthYear, setUserBirthYear] = useState<number | null>(null);
  const userNormSPS = getNormSPS(userBirthYear);

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wpmSamplerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);
  const isPausedRef = useRef(false);
  const lastSampledVersionRef = useRef(0);

  // Debounced visual state
  const [stableState, setStableState] = useState({
    label: "En attente", emoji: "🎤", colorClass: "text-muted-foreground", bgClass: "bg-muted"
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastChangeTime = useRef(0);

  // Fetch birth year and saved target
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_year, target_wpm").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.birth_year) {
          setUserBirthYear(data.birth_year);
        }
        // Prioritize user's saved target_wpm, fall back to age norm
        if (data?.target_wpm) {
          const savedSps = wpmToSps(data.target_wpm);
          const clamped = Math.round(savedSps * 2) / 2;
          const closest = [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((prev, curr) =>
            Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
          );
          setTargetSPS(closest as TargetSPS);
        } else if (data?.birth_year) {
          const norm = getNormSPS(data.birth_year);
          const closest = [2, 3, 4, 5, 6, 7, 8, 9].reduce((prev, curr) =>
            Math.abs(curr - norm) < Math.abs(prev - norm) ? curr : prev
          );
          setTargetSPS(closest as TargetSPS);
        }
      });
  }, [user]);

  // Theme prompts management
  const themePrompts = useMemo(() => DIALOGUE_THEMES[themeKey]?.prompts || [], [themeKey]);
  const getNextPrompt = useCallback(() => {
    if (themePrompts.length === 0) return "";
    const idx = promptIndexRef.current % themePrompts.length;
    promptIndexRef.current += 1;
    return themePrompts[idx];
  }, [themePrompts]);

  const skipToNextPrompt = useCallback(() => {
    const next = getNextPrompt();
    if (next) setCurrentPrompt(next);
  }, [getNextPrompt]);

  // No more manual smoothing — deepgram.packetSPS handles it natively

  // Sample SPS only when a NEW packet is computed (avoids stale value repetition)
  useEffect(() => {
    if (isRecording && !isPaused) {
      wpmSamplerRef.current = setInterval(() => {
        if (deepgram.packetVersion > lastSampledVersionRef.current && deepgram.packetSPS > 0) {
          lastSampledVersionRef.current = deepgram.packetVersion;
          const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
          setSessionSpsHistory(prev => [...prev, { timestamp: elapsed, sps: deepgram.packetSPS }]);
        }
      }, 500);
    } else {
      if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current);
    }
    return () => { if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current); };
  }, [isRecording, isPaused, deepgram.packetVersion, deepgram.packetSPS]);

  // Auto-stop when time runs out
  useEffect(() => {
    if (isRecording && remainingTime <= 0 && elapsedTime > 0) {
      stopRecording();
    }
  }, [remainingTime]);

  // Compute current feedback state
  const currentState = useMemo(() => {
    if (isPaused) return { label: "En pause", emoji: "⏸️", colorClass: "text-yellow-600 dark:text-yellow-400", bgClass: "bg-yellow-100 dark:bg-yellow-900/30" };
    if (deepgram.packetSPS < MIN_SPEAKING_SPS) return { label: !deepgram.isCalibrated ? "Calibration..." : "Parlez...", emoji: "🎤", colorClass: "text-muted-foreground", bgClass: "bg-muted" };
    const zone = getSPSZone(deepgram.packetSPS, targetSPS);
    let emoji = "🎤";
    if (zone.zone === 'perfect') emoji = "✅";
    else if (zone.zone === 'good') emoji = "👍";
    else if (zone.zone === 'too_slow') emoji = "🐢";
    else if (zone.zone === 'warning') emoji = "⚡";
    else if (zone.zone === 'danger') emoji = "🔴";
    return { label: zone.label, emoji, colorClass: zone.colorClass, bgClass: zone.bgClass };
  }, [deepgram.packetSPS, deepgram.isCalibrated, targetSPS, isPaused]);

  // Debounce visual state
  useEffect(() => {
    if (isPaused) { setStableState(currentState); return; }
    if (currentState.label === stableState.label) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const now = Date.now();
    if (now - lastChangeTime.current > FEEDBACK_DEBOUNCE_MS) {
      setStableState(currentState);
      lastChangeTime.current = now;
    } else {
      debounceTimer.current = setTimeout(() => {
        setStableState(currentState);
        lastChangeTime.current = Date.now();
      }, FEEDBACK_DEBOUNCE_MS);
    }
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [currentState, stableState.label, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: true, noiseSuppression: true, echoCancellation: false }
      });
      streamRef.current = stream;

      try { await deepgram.start(stream, { detectFillers: true, maxSpeakers: speakerCount || undefined }); } catch {
        toast.info("Enregistrement sans analyse en temps réel.", { duration: 3000 });
      }

      const mediaRecorder = createCompatibleRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      const isMp4 = mediaRecorder.mimeType?.includes("mp4") || mediaRecorder.mimeType?.includes("aac");
      mediaRecorder.start(isMp4 ? undefined : 1000);

      startTimeRef.current = Date.now();
      setRemainingTime(duration);
      setElapsedTime(0);

      isPausedRef.current = false;
      pausedElapsedRef.current = 0;

      timerRef.current = setInterval(() => {
        if (isPausedRef.current) return;
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
          setRemainingTime(Math.max(duration - elapsed, 0));
        }
      }, 1000);

      setIsRecording(true);
      setIsPaused(false);
      setSessionSpsHistory([{ timestamp: 0, sps: 0 }]); // Anchor curve at t=0
      lastSampledVersionRef.current = 0;
      // Initialize conversation prompt
      promptIndexRef.current = 0;
      const firstPrompt = getNextPrompt();
      setCurrentPrompt(firstPrompt);
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      isPausedRef.current = false;
      setIsPaused(false);
    } else {
      mediaRecorderRef.current?.pause();
      isPausedRef.current = true;
      setIsPaused(true);
    }
  };

  const stopRecording = async () => {
    setSaving(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmSamplerRef.current) clearInterval(wpmSamplerRef.current);
    deepgram.stop();
    mediaRecorderRef.current?.stop();
    await new Promise(r => setTimeout(r, 500));
    streamRef.current?.getTracks().forEach(t => t.stop());

    const spsValues = sessionSpsHistory.map(p => p.sps);
    const validSps = spsValues.filter(s => s >= 1.0);
    const realAvgSps = validSps.length > 0
      ? Math.round((validSps.reduce((a, b) => a + b, 0) / validSps.length) * 10) / 10
      : 0;
    const rawMaxSps = calculateSafeMaxSPS(spsValues);
    // Ensure max is always >= avg (safety net)
    const realMaxSps = Math.max(rawMaxSps, realAvgSps);

    try {
      const audioBlob = createAudioBlob(audioChunksRef.current);
      let fileName: string | null = null;
      if (audioBlob.size > 0) {
        fileName = getRecordingFileName(user?.id || "unknown");
        const { error } = await supabase.storage.from("recordings").upload(fileName, audioBlob);
        if (error) fileName = null;
      }

      const wpmData = sessionSpsHistory.map((point) => ({ timestamp: point.timestamp, wpm: spsToWpm(point.sps) }));

      const { data: session, error: dbError } = await supabase
        .from("sessions")
        .insert([{
          user_id: user?.id as string,
          duration_seconds: elapsedTime,
          avg_wpm: spsToWpm(realAvgSps),
          max_wpm: spsToWpm(realMaxSps),
          target_wpm: spsToWpm(targetSPS),
          recording_url: fileName,
          wpm_data: wpmData as unknown as ReturnType<typeof JSON.parse>,
          exercise_type: 'dialogue',
          word_timestamps: deepgram.getWordTimestamps() as unknown as ReturnType<typeof JSON.parse>,
        }])
        .select().single();

      if (dbError) throw dbError;

      // Save filler data to localStorage for session detail page
      if (deepgram.fillerCount > 0) {
        localStorage.setItem(`session_fillers_${session.id}`, JSON.stringify({
          fillerCount: deepgram.fillerCount,
          fillerDetails: deepgram.fillerDetails
        }));
      }

      const gamificationResult = await gamification.updateAfterSession(elapsedTime);

      setSessionResults({
        avgSps: realAvgSps, maxSps: realMaxSps, duration: elapsedTime,
        syllableCount: deepgram.syllableCount, wordCount: deepgram.wordCount,
        sessionId: session.id, fillerCount: deepgram.fillerCount, fillerDetails: deepgram.fillerDetails,
        actualSpeakingTime: deepgram.actualSpeakingTime, totalSessionTime: elapsedTime,
        streakIncremented: gamificationResult.streakIncremented,
        goalJustCompleted: gamificationResult.goalJustCompleted,
        frozenTargetSps: targetSPS,
      });
      setShowResultModal(true);
      setIsRecording(false);
      setSaving(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setShowResultModal(false);
    setSessionResults(null);
    setElapsedTime(0);
    setRemainingTime(0);
    deepgram.reset();
    setSessionSpsHistory([]);
    lastSampledVersionRef.current = 0;
  };

  const handleContinue = () => {
    setShowResultModal(false);
    if (sessionResults?.sessionId) navigate(`/session/${sessionResults.sessionId}`);
    else navigate("/dashboard");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Big gauge color
  const getGaugeColorForSPS = (sps: number) => {
    if (sps < MIN_SPEAKING_SPS) return "hsl(var(--muted-foreground))";
    const zone = getSPSZone(sps, targetSPS);
    if (zone.zone === 'perfect' || zone.zone === 'good') return "hsl(142, 76%, 45%)";
    if (zone.zone === 'too_slow') return "hsl(210, 80%, 60%)";
    if (zone.zone === 'warning') return "hsl(38, 92%, 50%)";
    if (zone.zone === 'danger') return "hsl(0, 84%, 60%)";
    return "hsl(var(--muted-foreground))";
  };

  const gaugeColor = useMemo(() => getGaugeColorForSPS(deepgram.packetSPS), [deepgram.packetSPS, targetSPS]);

  // Check if multiple speakers detected
  const speakerIds = Object.keys(deepgram.speakerSPS).map(Number);
  const hasMultipleSpeakers = speakerIds.length > 1;

  const getSpeakerFeedback = (sps: number) => {
    if (sps < MIN_SPEAKING_SPS) return { emoji: "🎤", label: "..." };
    const zone = getSPSZone(sps, targetSPS);
    if (zone.zone === 'perfect') return { emoji: "✅", label: "Parfait" };
    if (zone.zone === 'good') return { emoji: "👍", label: "Bien" };
    if (zone.zone === 'too_slow') return { emoji: "🐢", label: "Lent" };
    if (zone.zone === 'warning') return { emoji: "⚡", label: "Vite" };
    if (zone.zone === 'danger') return { emoji: "🔴", label: "Trop vite" };
    return { emoji: "🎤", label: "..." };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
      <ExerciseIntroModal categoryId="dialogue" onDismiss={() => setShowIntro(false)} forceOpen={showIntro} />
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm sm:text-base">Mode Dialogue</span>
          </div>
          <button onClick={() => setShowIntro(true)} className="text-muted-foreground hover:text-foreground transition-colors" title="Revoir les consignes">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center justify-center">
        {!isRecording ? (
          /* ──── Setup Screen ──── */
          <motion.div className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Intro */}
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <h1 className="text-2xl font-display font-bold mb-2">Mode Dialogue</h1>
              <p className="text-muted-foreground text-sm">
                Posez le téléphone sur la table et discutez naturellement. Chaque interlocuteur reçoit <strong className="text-foreground">sa propre jauge de débit</strong> en temps réel.
              </p>
            </div>

            {/* Duration Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⏱️</span>
                  <h3 className="text-sm font-bold">Durée de la session</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        duration === opt.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`text-sm font-bold ${duration === opt.value ? "text-primary" : ""}`}>
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Speed Selector */}
            <Card className="border-2 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">🎯 Objectif de vitesse</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">syllabes/sec</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SPS_LEVELS.map((preset) => (
                    <button
                      key={preset.sps}
                      onClick={() => setTargetSPS(preset.sps as TargetSPS)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        targetSPS === preset.sps
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-base mb-0.5">{preset.emoji}</div>
                      <div className={`text-xl font-bold ${targetSPS === preset.sps ? "text-primary" : ""}`}>{preset.sps}</div>
                      <div className="text-[9px] text-muted-foreground">{preset.shortDesc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  {SPS_LEVELS.find(p => p.sps === targetSPS)?.label}
                </p>
              </CardContent>
            </Card>

            {/* Biofeedback explanation for therapists */}
            <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/80">💡 Comment fonctionne le biofeedback ?</p>
              <p>
                Le débit est calculé <strong>par paquets de 5 syllabes</strong> : 
                toutes les 5 syllabes prononcées, le système mesure le temps écoulé et calcule la vitesse réelle. 
                Cela offre une jauge <strong>stable et précise</strong> — chaque mise à jour reflète un vrai segment de parole.
              </p>
              <p className="text-muted-foreground/70">
                ⏳ La jauge s'active après les 5 premières syllabes — c'est normal si elle ne réagit pas immédiatement.
              </p>
            </div>

            {/* Speaker count selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Nombre d'interlocuteurs</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 0, label: "Auto", desc: "Détection auto" },
                    { value: 1, label: "1", desc: "Seul" },
                    { value: 2, label: "2", desc: "Duo" },
                    { value: 3, label: "3", desc: "Trio" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSpeakerCount(opt.value)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        speakerCount === opt.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`text-sm font-bold ${speakerCount === opt.value ? "text-primary" : ""}`}>
                        {opt.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fixer le nombre évite les faux interlocuteurs causés par le bruit ambiant.
                </p>
              </CardContent>
            </Card>

            {/* Theme Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💬</span>
                  <h3 className="text-sm font-bold">Thème de conversation</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(DIALOGUE_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        themeKey === key
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-base mb-0.5">{theme.emoji}</div>
                      <div className={`text-xs font-bold ${themeKey === key ? "text-primary" : ""}`}>
                        {theme.label}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {themeKey === "libre" 
                    ? "Pas de questions suggérées — conversation totalement libre."
                    : `Des questions s'afficheront pendant l'exercice pour guider la conversation.`
                  }
                </p>
              </CardContent>
            </Card>
            {/* Start */}
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={startRecording} className="h-16 px-10 rounded-2xl text-lg gap-3 shadow-lg shadow-primary/25">
                <MessageCircle className="w-6 h-6" />
                Lancer le dialogue
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ──── Recording Screen — BIG GAUGE ──── */
          <motion.div
            className="w-full flex flex-col items-center justify-center gap-6 flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Countdown */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Temps restant</p>
              <p className="text-4xl font-mono font-bold tabular-nums">{formatTime(remainingTime)}</p>
            </div>

            {/* BIG Emoji + Label — Dual gauges when multiple speakers */}
            {hasMultipleSpeakers ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {speakerIds.map((sid, idx) => {
                    const sps = deepgram.speakerSPS[sid] || 0;
                    const color = getGaugeColorForSPS(sps);
                    const feedback = getSpeakerFeedback(sps);
                    const size = speakerIds.length <= 2 ? "w-40 h-40" : "w-32 h-32";
                    const emojiSize = speakerIds.length <= 2 ? "text-4xl" : "text-3xl";
                    return (
                      <div key={sid} className="flex flex-col items-center">
                        <div
                          className={`flex flex-col items-center justify-center ${size} rounded-full border-4 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]`}
                          style={{ borderColor: color, backgroundColor: `${color}15` }}
                        >
                          <span className={emojiSize}>{feedback.emoji}</span>
                          <span className="text-sm font-bold mt-1" style={{ color }}>
                            {feedback.label}
                          </span>
                          {sps >= MIN_SPEAKING_SPS && (
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {sps.toFixed(1)} syll/s
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground mt-2">
                          Personne {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <FlaskConical className="w-3 h-3" />
                  Diarisation expérimentale
                </Badge>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]`}
                style={{ borderColor: gaugeColor, backgroundColor: `${gaugeColor}15` }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stableState.emoji}
                    initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="text-7xl"
                  >
                    {stableState.emoji}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stableState.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className={`text-xl font-bold mt-2`}
                    style={{ color: gaugeColor }}
                  >
                    {stableState.label}
                  </motion.span>
                </AnimatePresence>
                {deepgram.packetSPS >= MIN_SPEAKING_SPS && (
                  <span className="text-xs text-muted-foreground mt-1 transition-opacity duration-500">
                    {deepgram.packetSPS.toFixed(1)} syll/s
                  </span>
                )}
              </div>
            )}

            {/* Conversation prompt */}
            {currentPrompt && (
              <motion.div
                key={currentPrompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 max-w-sm text-center"
              >
                <p className="text-sm font-medium text-foreground">{currentPrompt}</p>
                <button
                  onClick={skipToNextPrompt}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <SkipForward className="w-3 h-3" /> Question suivante
                </button>
              </motion.div>
            )}

            {/* Target + Fillers */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Objectif : <span className="font-bold text-foreground">{targetSPS} syll/s</span>
              </p>
              <FillerPill count={deepgram.fillerCount} isRecording={isRecording} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4">
              <Button variant="outline" size="lg" onClick={togglePause} className="h-14 px-6 rounded-xl gap-2">
                {isPaused ? <><Play className="w-5 h-5" /> Reprendre</> : <><Pause className="w-5 h-5" /> Pause</>}
              </Button>
              <Button variant="destructive" size="lg" onClick={stopRecording} disabled={saving} className="h-14 px-6 rounded-xl gap-2">
                <Square className="w-5 h-5" /> Terminer
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Result Modal */}
      {sessionResults && (
        <SessionResultModal
          open={showResultModal}
          onOpenChange={setShowResultModal}
          avgSps={sessionResults.avgSps}
          targetSps={sessionResults.frozenTargetSps}
          syllableCount={sessionResults.syllableCount}
          sessionId={sessionResults.sessionId}
          onContinue={handleContinue}
          onRetry={handleRetry}
          actualSpeakingTime={sessionResults.actualSpeakingTime}
          totalSessionTime={sessionResults.totalSessionTime}
          streakIncremented={sessionResults.streakIncremented}
          goalJustCompleted={sessionResults.goalJustCompleted}
          currentStreak={gamification.currentStreak}
          todayMinutes={gamification.todayMinutes}
          dailyGoal={gamification.dailyGoal}
          goalProgress={gamification.goalProgress}
        />
      )}
    </div>
  );
};

export default Dialogue;
