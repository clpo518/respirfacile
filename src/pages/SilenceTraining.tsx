import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createCompatibleRecorder, createAudioBlob } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Timer, Play, Pause, Square, Volume2, VolumeX, HelpCircle, Zap, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useVolumeAnalyzer } from "@/hooks/useVolumeAnalyzer";
import { useGamification } from "@/hooks/useGamification";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";
import WaveSurfer from "wavesurfer.js";

// ─── Themed Prompts ───
interface ThemeConfig {
  label: string;
  emoji: string;
  prompts: string[];
}

const THEMES: Record<string, ThemeConfig> = {
  routine: {
    label: "Routine",
    emoji: "☀️",
    prompts: [
      "Décrivez votre routine du matin.",
      "Que prenez-vous au petit-déjeuner habituellement ?",
      "Comment vous rendez-vous au travail ou à l'école ?",
      "Que faites-vous en rentrant le soir ?",
      "Comment se passe votre heure du coucher ?",
      "Y a-t-il un rituel que vous ne ratez jamais ?",
      "Quel moment de la journée préférez-vous ?",
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
      "Quel est votre souvenir de Noël préféré ?",
      "Racontez un souvenir avec un ami proche.",
      "Quel moment de fierté gardez-vous en mémoire ?",
    ],
  },
  loisirs: {
    label: "Loisirs",
    emoji: "🎮",
    prompts: [
      "Quel est votre hobby préféré ?",
      "Parlez d'un film que vous avez vu récemment.",
      "Quel livre recommanderiez-vous ?",
      "Pratiquez-vous un sport ? Lequel ?",
      "Décrivez votre dernier week-end.",
      "Qu'aimez-vous faire quand il pleut ?",
      "Si vous aviez une journée entière libre, que feriez-vous ?",
    ],
  },
  imagination: {
    label: "Imagination",
    emoji: "🌈",
    prompts: [
      "Si vous pouviez voyager n'importe où, où iriez-vous ?",
      "Quel super-pouvoir choisiriez-vous ?",
      "Décrivez votre maison de rêve.",
      "Si vous pouviez dîner avec une célébrité, qui serait-ce ?",
      "Inventez un métier qui n'existe pas encore.",
      "Décrivez un monde idéal selon vous.",
      "Quel conseil donneriez-vous à votre vous de 15 ans ?",
    ],
  },
  mixte: {
    label: "Mélange",
    emoji: "🎲",
    prompts: [
      "Qu'est-ce qui vous passionne dans la vie ?",
      "Racontez un repas mémorable.",
      "Décrivez votre saison préférée et pourquoi.",
      "Parlez d'une personne qui vous inspire.",
      "Quel est votre endroit préféré pour vous détendre ?",
      "Décrivez un talent caché que vous avez.",
      "Quelle est la dernière chose qui vous a fait rire ?",
    ],
  },
};

type Mode = "classic" | "interruption";
const SILENCE_GRACE_MS = 800; // Grace period (ms) to let voice trail off at start of silence
type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; silences: number[]; speakTime: number; description: string }> = {
  easy:   { label: "Débutant",     emoji: "🌱", silences: [2, 2, 3, 3, 4],          speakTime: 20, description: "Pauses courtes (2-4s)" },
  medium: { label: "Intermédiaire", emoji: "🎯", silences: [3, 3, 4, 5, 5, 6],      speakTime: 20, description: "Pauses modérées (3-6s)" },
  hard:   { label: "Avancé",        emoji: "🏆", silences: [4, 5, 5, 6, 7, 7, 8],   speakTime: 25, description: "Pauses longues (4-8s)" },
};

type Phase = "countdown" | "silence" | "speaking" | "transition";

interface RoundResult {
  silenceDuration: number;
  silenceRespected: boolean;
}

// ─── Waveform visualization for bilan ───
interface SilenceWaveformProps {
  audioUrl: string;
  results: RoundResult[];
  config: typeof DIFFICULTY_CONFIG[Difficulty];
  mode: Mode;
}

const SilenceWaveform = ({ audioUrl, results, config, mode }: SilenceWaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(var(--muted-foreground) / 0.3)",
      progressColor: "hsl(var(--primary))",
      cursorColor: "hsl(var(--primary))",
      cursorWidth: 2,
      height: 80,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
    });

    ws.load(audioUrl);

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      // Add region markers for silence/speaking phases
      addPhaseRegions(ws, ws.getDuration());
    });
    ws.on("audioprocess", () => setCurrentTime(ws.getCurrentTime()));
    ws.on("seeking", () => setCurrentTime(ws.getCurrentTime()));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wsRef.current = ws;
    return () => { ws.destroy(); };
  }, [audioUrl]);

  // Compute phase regions based on results and config
  const addPhaseRegions = (ws: WaveSurfer, totalDuration: number) => {
    if (!containerRef.current || totalDuration <= 0) return;
    // We'll draw the regions as a canvas overlay
  };

  const togglePlay = () => {
    if (wsRef.current) wsRef.current.playPause();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Build phase timeline for overlay
  const phases: { start: number; end: number; type: "speaking" | "silence"; respected?: boolean }[] = [];
  let t = 0;
  // Add countdown (3s)
  t += 3;
  
  if (mode === "classic") {
    results.forEach((r, i) => {
      // Silence phase
      const silStart = t;
      t += r.silenceDuration;
      phases.push({ start: silStart, end: t, type: "silence", respected: r.silenceRespected });
      // Speaking phase
      const spkStart = t;
      t += config.speakTime;
      phases.push({ start: spkStart, end: t, type: "speaking" });
    });
  } else {
    // Interruption: speaking then silence interruptions
    results.forEach((r, i) => {
      const spkStart = t;
      // Approximate speaking time before interruption
      const approxSpeak = config.speakTime * 0.6;
      t += approxSpeak;
      phases.push({ start: spkStart, end: t, type: "speaking" });
      // Silence interruption
      const silStart = t;
      t += r.silenceDuration;
      phases.push({ start: silStart, end: t, type: "silence", respected: r.silenceRespected });
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Volume2 className="w-4 h-4" /> Réécouter la session
        </h3>

        {/* Phase timeline legend */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40 inline-block" /> Parole
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40 inline-block" /> Silence tenu
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/40 inline-block" /> Silence rompu
          </span>
        </div>

        {/* Phase timeline bar */}
        {duration > 0 && (
          <div className="relative h-4 rounded-full bg-muted/50 overflow-hidden mb-2">
            {phases.map((p, i) => {
              const left = (p.start / duration) * 100;
              const width = ((p.end - p.start) / duration) * 100;
              const color = p.type === "speaking"
                ? "bg-primary/20"
                : p.respected
                  ? "bg-emerald-500/30"
                  : "bg-orange-500/30";
              return (
                <div
                  key={i}
                  className={`absolute top-0 h-full ${color}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
            {/* Playhead */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary z-10 transition-all"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        )}

        {/* Waveform */}
        <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />

        {/* Controls */}
        <div className="flex items-center justify-between mt-3">
          <Button variant="outline" size="sm" onClick={togglePlay} className="gap-2">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Écouter"}
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SilenceTraining = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const volume = useVolumeAnalyzer();
  const gamification = useGamification();

  // Setup
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<Mode>("classic");
  const [themeKey, setThemeKey] = useState<string>("routine");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showIntroHelp, setShowIntroHelp] = useState(false);

  // Session state
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [spokeInSilence, setSpokeInSilence] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);

  // Interruption mode state
  const [interruptionActive, setInterruptionActive] = useState(false);
  const interruptionTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Grace period: ignore voice detection for the first N ms of a silence phase
  const silencePhaseStartRef = useRef<number>(0);

  // Audio recording
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const promptIndexRef = useRef(0);

  // Track consecutive above-threshold readings for better detection
  const consecutiveSpeakingRef = useRef(0);

  const config = DIFFICULTY_CONFIG[difficulty];
  const totalRounds = config.silences.length;
  const themePrompts = THEMES[themeKey]?.prompts || THEMES.mixte.prompts;

  const getNextPrompt = useCallback(() => {
    const idx = promptIndexRef.current % themePrompts.length;
    promptIndexRef.current += 1;
    return themePrompts[idx];
  }, [themePrompts]);

  // ─── Start session with countdown ───
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      streamRef.current = stream;
      volume.startAnalyzing(stream);

      // Start audio recording
      try {
        const mediaRecorder = createCompatibleRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        const isMp4 = mediaRecorder.mimeType?.includes("mp4") || mediaRecorder.mimeType?.includes("aac");
        mediaRecorder.start(isMp4 ? undefined : 1000);
      } catch {
        // Recording not critical
      }

      promptIndexRef.current = 0;
      setResults([]);
      setCurrentRound(0);
      setFinished(false);
      setStarted(true);
      consecutiveSpeakingRef.current = 0;

      // Show prompt + countdown before starting
      const firstPrompt = getNextPrompt();
      setCurrentPrompt(firstPrompt);
      setPhase("countdown");
      setCountdownValue(3);

      let count = 3;
      countdownRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          // Start the actual exercise
          if (mode === "classic") {
            beginSilencePhaseAfterCountdown(0, firstPrompt);
          } else {
            beginSpeakingPhaseInterruptionAfterCountdown(0, firstPrompt);
          }
        } else {
          setCountdownValue(count);
        }
      }, 1000);
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
  };

  // ─── Classic mode: begin silence phase (with prompt already set or new prompt) ───
  const beginSilencePhaseAfterCountdown = useCallback((roundIdx: number, prompt: string) => {
    const dur = DIFFICULTY_CONFIG[difficulty].silences[roundIdx];
    setPhase("silence");
    setPhaseDuration(dur);
    setPhaseTimer(dur);
    setSpokeInSilence(false);
    setShowWarning(false);
    setInterruptionActive(false);
    setCurrentPrompt(prompt);
    setCurrentRound(roundIdx);
    consecutiveSpeakingRef.current = 0;
    silencePhaseStartRef.current = Date.now(); // Start grace period
  }, [difficulty]);

  const beginSilencePhase = useCallback((roundIdx: number) => {
    beginSilencePhaseAfterCountdown(roundIdx, getNextPrompt());
  }, [beginSilencePhaseAfterCountdown, getNextPrompt]);

  const beginSpeakingPhase = useCallback(() => {
    const dur = DIFFICULTY_CONFIG[difficulty].speakTime;
    setPhase("speaking");
    setPhaseDuration(dur);
    setPhaseTimer(dur);
    setInterruptionActive(false);
    consecutiveSpeakingRef.current = 0;
  }, [difficulty]);

  // ─── Interruption mode phases ───
  const beginSpeakingPhaseInterruptionAfterCountdown = useCallback((roundIdx: number, prompt: string) => {
    setCurrentPrompt(prompt);
    setCurrentRound(roundIdx);
    const dur = DIFFICULTY_CONFIG[difficulty].speakTime;
    setPhase("speaking");
    setPhaseDuration(dur);
    setPhaseTimer(dur);
    setInterruptionActive(false);
    setSpokeInSilence(false);
    setShowWarning(false);
    consecutiveSpeakingRef.current = 0;

    // Schedule a random interruption during speaking
    const silenceDur = DIFFICULTY_CONFIG[difficulty].silences[roundIdx] || 3;
    const minDelay = 4;
    const maxDelay = Math.max(dur - silenceDur - 2, minDelay + 1);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;

    if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
    interruptionTimerRef.current = setTimeout(() => {
      setInterruptionActive(true);
      setPhase("silence");
      setPhaseDuration(silenceDur);
      setPhaseTimer(silenceDur);
      setSpokeInSilence(false);
      setShowWarning(false);
      consecutiveSpeakingRef.current = 0;
    }, delay * 1000);
  }, [difficulty]);

  const beginSpeakingPhaseInterruption = useCallback((roundIdx: number) => {
    beginSpeakingPhaseInterruptionAfterCountdown(roundIdx, getNextPrompt());
  }, [beginSpeakingPhaseInterruptionAfterCountdown, getNextPrompt]);

  // ─── Timer tick ───
  useEffect(() => {
    if (!started || finished) return;

    timerRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          if (mode === "classic") {
            if (phase === "silence") {
              setResults(r => [...r, { silenceDuration: phaseDuration, silenceRespected: !spokeInSilence }]);
              beginSpeakingPhase();
            } else if (phase === "speaking") {
              const nextRound = currentRound + 1;
              if (nextRound >= totalRounds) {
                endSession();
              } else {
                beginSilencePhase(nextRound);
              }
            }
          } else {
            // Interruption mode
            if (phase === "silence") {
              // Silence (interruption) ended — record result, RESUME same prompt
              setResults(r => [...r, { silenceDuration: phaseDuration, silenceRespected: !spokeInSilence }]);
              setInterruptionActive(false);
              // Resume speaking with the SAME prompt (don't change topic)
              const dur = DIFFICULTY_CONFIG[difficulty].speakTime;
              setPhase("speaking");
              setPhaseDuration(dur);
              setPhaseTimer(dur);
              setSpokeInSilence(false);
              setShowWarning(false);
              // Schedule next interruption for next round
              const nextRound = currentRound + 1;
              if (nextRound >= totalRounds) {
                // No more interruptions, just let them finish speaking then end
                if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
                interruptionTimerRef.current = setTimeout(() => {
                  endSession();
                }, dur * 1000);
              } else {
                // Schedule next interruption
                const nextSilenceDur = DIFFICULTY_CONFIG[difficulty].silences[nextRound] || 3;
                const minDelay = 4;
                const maxDelay = Math.max(dur - nextSilenceDur - 2, minDelay + 1);
                const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
                setCurrentRound(nextRound);
                if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
                interruptionTimerRef.current = setTimeout(() => {
                  setInterruptionActive(true);
                  setPhase("silence");
                  setPhaseDuration(nextSilenceDur);
                  setPhaseTimer(nextSilenceDur);
                  setSpokeInSilence(false);
                  setShowWarning(false);
                  consecutiveSpeakingRef.current = 0;
                  silencePhaseStartRef.current = Date.now(); // Grace period for interruption
                }, delay * 1000);
              }
            } else if (phase === "speaking" && !interruptionActive) {
              // Speaking phase ended without interruption triggering yet (edge case)
              if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
              const nextRound = currentRound + 1;
              if (nextRound >= totalRounds) {
                endSession();
              } else {
                beginSpeakingPhaseInterruption(nextRound);
              }
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, phase, phaseDuration, spokeInSilence, currentRound, totalRounds, mode, interruptionActive, beginSpeakingPhase, beginSilencePhase, beginSpeakingPhaseInterruption]);

  // ─── Detect speech during silence (with grace period + sustained detection) ───
  useEffect(() => {
    if (phase !== "silence" || spokeInSilence) return;

    // Grace period: ignore voice for SILENCE_GRACE_MS after silence phase starts
    // This allows the user's voice to trail off naturally (especially in interruption mode)
    const elapsed = Date.now() - silencePhaseStartRef.current;
    if (elapsed < SILENCE_GRACE_MS) return;

    if (volume.isSpeaking) {
      consecutiveSpeakingRef.current += 1;
      // Require 3 consecutive detections to confirm real speech (not ambient noise)
      if (consecutiveSpeakingRef.current >= 3) {
        setSpokeInSilence(true);
        setShowWarning(true);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 2000);
      }
    } else {
      consecutiveSpeakingRef.current = 0;
    }
  }, [phase, volume.isSpeaking, spokeInSilence, volume.volumeLevel]); // volumeLevel triggers re-eval for grace period

  // ─── End ───
  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
    volume.stopAnalyzing();

    // Stop audio recording and create playback URL
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    await new Promise(r => setTimeout(r, 300));
    if (audioChunksRef.current.length > 0) {
      const blob = createAudioBlob(audioChunksRef.current);
      if (blob.size > 0) {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      }
    }

    streamRef.current?.getTracks().forEach(t => t.stop());
    setFinished(true);
    setPhase("transition");

    const totalTime = results.length * (config.speakTime + 4);
    try {
      await gamification.updateAfterSession(Math.round(totalTime));
    } catch {}
  }, [volume, results, config, gamification, audioUrl]);

  const stopEarly = () => {
    if (phase === "silence") {
      setResults(r => [...r, { silenceDuration: phaseDuration, silenceRespected: !spokeInSilence }]);
    }
    endSession();
  };

  // ─── Skip to next question ───
  const skipToNextQuestion = () => {
    // Record current result if in silence phase
    if (phase === "silence") {
      setResults(r => [...r, { silenceDuration: phaseDuration, silenceRespected: !spokeInSilence }]);
    }
    
    const nextRound = currentRound + 1;
    if (nextRound >= totalRounds) {
      endSession();
    } else if (mode === "classic") {
      beginSilencePhase(nextRound);
    } else {
      if (interruptionTimerRef.current) clearTimeout(interruptionTimerRef.current);
      beginSpeakingPhaseInterruption(nextRound);
    }
  };

  // ─── Computed results ───
  const finalResults = finished ? results : [];
  const pausesRespected = finalResults.filter(r => r.silenceRespected).length;
  const totalPauses = finalResults.length;
  const totalSilenceTime = finalResults.reduce((sum, r) => sum + r.silenceDuration, 0);
  const successRate = totalPauses > 0 ? Math.round((pausesRespected / totalPauses) * 100) : 0;

  const progressPercent = phaseDuration > 0 ? ((phaseDuration - phaseTimer) / phaseDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30 flex flex-col">
      <ExerciseIntroModal categoryId="silence-training" onDismiss={() => setShowIntroHelp(false)} forceOpen={showIntroHelp} />
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm sm:text-base">Tolérance au Silence</span>
          </div>
          <button onClick={() => setShowIntroHelp(true)} className="text-muted-foreground hover:text-foreground transition-colors" title="Revoir les consignes">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-lg flex flex-col items-center justify-center">
        {!started ? (
          /* ──── Setup Screen ──── */
          <motion.div className="w-full space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <div className="text-5xl mb-3">🧘</div>
              <h1 className="text-2xl font-display font-bold mb-2">Tolérance au Silence</h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Entraînez-vous à accepter les pauses. Choisissez un thème et un mode d'entraînement.
              </p>
            </div>

            {/* Mode selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎮</span>
                  <h3 className="text-sm font-bold">Mode d'entraînement</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("classic")}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      mode === "classic" ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">🧘</div>
                    <div className={`text-sm font-bold ${mode === "classic" ? "text-primary" : ""}`}>Classique</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Silence avant de parler</div>
                  </button>
                  <button
                    onClick={() => setMode("interruption")}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      mode === "interruption" ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">⚡</div>
                    <div className={`text-sm font-bold ${mode === "interruption" ? "text-primary" : ""}`}>Interruption</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Pause imposée en plein discours</div>
                  </button>
                </div>
                {mode === "interruption" && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    Vous parlez, puis une pause s'impose de façon aléatoire. Plus réaliste !
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Theme selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💬</span>
                  <h3 className="text-sm font-bold">Thème des questions</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        themeKey === key ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-xl mb-0.5">{theme.emoji}</div>
                      <div className={`text-[10px] font-bold ${themeKey === key ? "text-primary" : ""}`}>{theme.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Les questions du même thème s'enchaînent et approfondissent.
                </p>
              </CardContent>
            </Card>

            {/* Difficulty */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎚️</span>
                  <h3 className="text-sm font-bold">Niveau de difficulté</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof config][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        difficulty === key
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{val.emoji}</div>
                      <div className={`text-sm font-bold ${difficulty === key ? "text-primary" : ""}`}>{val.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{val.description}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {config.silences.length} questions · Pauses de {config.silences[0]}s à {config.silences[config.silences.length - 1]}s
                </p>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground/80">💡 Comment ça marche ?</p>
              {mode === "classic" ? (
                <div className="space-y-1.5">
                  <p>1️⃣ Une question s'affiche → <strong>restez en silence</strong> pendant le décompte</p>
                  <p>2️⃣ Quand le signal apparaît → <strong>répondez librement</strong></p>
                  <p>3️⃣ Les pauses augmentent progressivement pour vous désensibiliser</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p>1️⃣ Une question s'affiche → <strong>commencez à répondre</strong> immédiatement</p>
                  <p>2️⃣ Une pause s'impose <strong>de façon aléatoire</strong> pendant que vous parlez</p>
                  <p>3️⃣ Arrêtez-vous net et <strong>tenez le silence</strong> imposé</p>
                </div>
              )}
              <p className="text-muted-foreground/70 mt-2">
                🎯 Objectif : constater que vos pauses sont perçues comme naturelles par votre interlocuteur.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={startSession} className="h-16 px-10 rounded-2xl text-lg gap-3 shadow-lg shadow-primary/25">
                <Play className="w-6 h-6" />
                Commencer
              </Button>
            </div>
          </motion.div>
        ) : !finished ? (
          /* ──── Active Session ──── */
          <motion.div
            className="w-full flex flex-col items-center justify-center gap-6 flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Countdown phase */}
            {phase === "countdown" ? (
              <motion.div className="flex flex-col items-center gap-6">
                <p className="text-sm text-muted-foreground">Préparez-vous…</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPrompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center px-4"
                  >
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground leading-relaxed">
                      « {currentPrompt} »
                    </p>
                  </motion.div>
                </AnimatePresence>
                <motion.div
                  key={countdownValue}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="w-32 h-32 rounded-full border-4 border-primary/50 bg-primary/10 flex items-center justify-center"
                >
                  <span className="text-5xl font-mono font-bold text-primary">{countdownValue}</span>
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  {mode === "classic" ? "Silence à tenir…" : "Vous allez parler…"}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Round indicator */}
                <div className="text-sm text-muted-foreground">
                  Question {currentRound + 1} / {totalRounds}
                  {mode === "interruption" && <span className="ml-2 text-primary">⚡ Interruption</span>}
                </div>

                {/* Prompt */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPrompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center px-4"
                  >
                    <p className="text-xl sm:text-2xl font-display font-bold text-foreground leading-relaxed">
                      « {currentPrompt} »
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Phase indicator */}
                <AnimatePresence mode="wait">
                  {phase === "silence" ? (
                    <motion.div
                      key="silence"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-4 w-full max-w-xs"
                    >
                      <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 transition-all duration-500 ${
                        spokeInSilence 
                          ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" 
                          : "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                      }`}>
                        <VolumeX className={`w-8 h-8 mb-1 ${spokeInSilence ? "text-orange-500" : "text-blue-500"}`} />
                        <span className="text-4xl font-mono font-bold tabular-nums">{phaseTimer}s</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {interruptionActive ? "STOP !" : "Silence"}
                        </span>
                      </div>

                      <div className="w-full">
                        <Progress value={progressPercent} className="h-3" />
                      </div>

                      <AnimatePresence>
                        {showWarning && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-orange-600 dark:text-orange-400 font-medium text-center"
                          >
                            {interruptionActive ? "Arrêtez-vous ! 🛑" : "Pas encore… respirez 🌬️"}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {!showWarning && (
                        <p className="text-sm text-muted-foreground text-center">
                          {interruptionActive ? "Stoppez net — tenez le silence." : "Attendez en silence… la pause est naturelle."}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {volume.isSpeaking ? (
                          <><Volume2 className="w-3.5 h-3.5 text-orange-500" /> Parole détectée</>
                        ) : (
                          <><VolumeX className="w-3.5 h-3.5 text-emerald-500" /> Silence ✓</>
                        )}
                      </div>
                    </motion.div>
                  ) : phase === "speaking" ? (
                    <motion.div
                      key="speaking"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-4 w-full max-w-xs"
                    >
                      <div className="flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
                        <Volume2 className="w-8 h-8 mb-1 text-emerald-500" />
                        <span className="text-4xl font-mono font-bold tabular-nums">{phaseTimer}s</span>
                        <span className="text-xs text-muted-foreground mt-1">Parlez !</span>
                      </div>

                      <div className="w-full">
                        <Progress value={progressPercent} className="h-3" />
                      </div>

                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center">
                        🎙️ C'est à vous ! Répondez à la question.
                      </p>

                      {mode === "interruption" && (
                        <p className="text-xs text-muted-foreground/70 text-center">
                          ⚡ Une pause peut arriver à tout moment…
                        </p>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  {/* Skip to next question */}
                  <Button variant="outline" size="lg" onClick={skipToNextQuestion} className="h-12 px-4 rounded-xl gap-2">
                    <SkipForward className="w-5 h-5" /> Question suivante
                  </Button>
                  {/* Stop button */}
                  <Button variant="destructive" size="lg" onClick={stopEarly} className="h-12 px-6 rounded-xl gap-2">
                    <Square className="w-5 h-5" /> Terminer
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          /* ──── Results Screen ──── */
          <motion.div
            className="w-full space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">
                {successRate >= 80 ? "🎉" : successRate >= 50 ? "👍" : "💪"}
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                {successRate >= 80 ? "Excellent !" : successRate >= 50 ? "Bon travail !" : "Bel effort !"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === "interruption" 
                  ? "Les interruptions renforcent votre capacité à vous arrêter en plein discours."
                  : "Vous apprenez à accepter les silences. Chaque session renforce votre tolérance."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{pausesRespected}/{totalPauses}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pauses tenues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{successRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Réussite</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{totalSilenceTime}s</p>
                  <p className="text-xs text-muted-foreground mt-1">Silence total</p>
                </CardContent>
              </Card>
            </div>

            {/* Round details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3">Détail par question</h3>
                <div className="space-y-2">
                  {finalResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Question {i + 1} ({r.silenceDuration}s)</span>
                      <span className={r.silenceRespected ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-orange-600 dark:text-orange-400 font-medium"}>
                        {r.silenceRespected ? "✓ Tenue" : "✗ Parlé"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audio Waveform Playback */}
            {audioUrl && (
              <SilenceWaveform audioUrl={audioUrl} results={finalResults} config={config} mode={mode} />
            )}

            {/* Encouragement */}
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground/80 mb-1">💡 Le saviez-vous ?</p>
              <p>
                Une pause de 3 à 5 secondes en conversation est perçue comme tout à fait naturelle par votre interlocuteur. 
                Votre cerveau la perçoit comme plus longue qu'elle ne l'est réellement.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg" onClick={() => { setStarted(false); setFinished(false); setResults([]); }} className="gap-2">
                <Play className="w-5 h-5" /> Recommencer
              </Button>
              <Button size="lg" onClick={() => navigate("/library")} className="gap-2">
                Retour à la bibliothèque
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SilenceTraining;
