import { useState, useRef, useCallback, useEffect } from "react";
import { createCompatibleRecorder, createAudioBlob, getRecordingFileName } from "@/lib/audioCompat";
import { getSpeechMediaConstraints } from "@/lib/audioConstraints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, Square, Volume2, VolumeX, Brain, RotateCcw, BookOpen, Pause, Play, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getCategoryById, Exercise } from "@/data/exercises";
import VolumeGauge from "@/components/practice/VolumeGauge";
import { useVolumeBiofeedback } from "@/hooks/useVolumeBiofeedback";
import RetellingPlayer from "@/components/practice/RetellingPlayer";
import CountdownOverlay from "@/components/practice/CountdownOverlay";
import ExerciseIntroModal from "@/components/practice/ExerciseIntroModal";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";

type NeuroMode = "projection" | "articulation" | "coherence";

const NeurologyTraining = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "";
  const gamification = useGamification();

  // Detect mode from category
  const mode: NeuroMode = categoryId.includes("projection")
    ? "projection"
    : categoryId.includes("coherence")
    ? "coherence"
    : "articulation";

  const category = getCategoryById(categoryId);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(
    category?.exercises[0] || null
  );

  // Projection mode state
  const volumeBiofeedback = useVolumeBiofeedback();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showBilan, setShowBilan] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [introForceOpen, setIntroForceOpen] = useState(false);

  // Articulation item-by-item state
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Split articulation text into individual items
  const articulationItems = (() => {
    if (mode !== "articulation" || !currentExercise?.text) return [];
    return currentExercise.text
      .split(/\.\s+/)
      .map(s => s.replace(/\.$/, '').trim())
      .filter(s => s.length > 0);
  })();

  // Update exercise when index changes
  useEffect(() => {
    if (category && category.exercises[currentExerciseIndex]) {
      setCurrentExercise(category.exercises[currentExerciseIndex]);
      setCurrentItemIndex(0);
    }
  }, [currentExerciseIndex, category]);

  const handleBack = () => navigate("/library");

  // ========== PROJECTION MODE ==========

  const startProjectionRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      streamRef.current = stream;

      // Start volume biofeedback
      volumeBiofeedback.start(stream);

      // Start media recorder for saving
      const mediaRecorder = createCompatibleRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      const isMp4 = mediaRecorder.mimeType?.includes("mp4") || mediaRecorder.mimeType?.includes("aac");
      mediaRecorder.start(isMp4 ? undefined : 1000);
      mediaRecorderRef.current = mediaRecorder;

      // Timer
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);
      setShowBilan(false);
    } catch (err) {
      toast.error("Impossible d'accéder au microphone");
    }
  }, [volumeBiofeedback]);

  const stopProjectionRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    volumeBiofeedback.stop();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);

    // Upload audio
    if (user && audioChunksRef.current.length > 0) {
      const blob = createAudioBlob(audioChunksRef.current);
      const fileName = getRecordingFileName(user.id, "neuro_");
      await supabase.storage.from("recordings").upload(fileName, blob);

      // Save session
      await supabase.from("sessions").insert({
        user_id: user.id,
        avg_wpm: Math.round(volumeBiofeedback.avgVolume * 1000), // store volume as proxy
        max_wpm: Math.round(volumeBiofeedback.maxVolume * 1000),
        duration_seconds: elapsedTime,
        exercise_type: "neuro_projection",
        recording_url: fileName,
        notes: `Volume moyen: ${Math.round((volumeBiofeedback.avgVolume / volumeBiofeedback.baselineVolume) * 100)}% | Temps en zone: ${Math.round(volumeBiofeedback.timeInTargetZone)}s`,
      });

      gamification.updateAfterSession(elapsedTime);
    }

    setShowBilan(true);
  }, [user, elapsedTime, volumeBiofeedback, gamification]);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    startProjectionRecording();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Navigate exercises
  const nextExercise = () => {
    if (category && currentExerciseIndex < category.exercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setShowBilan(false);
      volumeBiofeedback.resetCalibration();
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((i) => i - 1);
      setShowBilan(false);
      volumeBiofeedback.resetCalibration();
    }
  };

  // ========== COHERENCE MODE → delegate to RetellingPlayer ==========
  if (mode === "coherence" && currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
        <ExerciseIntroModal categoryId={categoryId} onDismiss={() => setIntroForceOpen(false)} forceOpen={introForceOpen} />
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Cohérence Narrative</span>
            </div>
            <button onClick={() => setIntroForceOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Exercise selector */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={prevExercise} disabled={currentExerciseIndex === 0}>
              ← Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentExerciseIndex + 1} / {category?.exercises.length}
            </span>
            <Button variant="ghost" size="sm" onClick={nextExercise} disabled={!category || currentExerciseIndex >= category.exercises.length - 1}>
              Suivant →
            </Button>
          </div>
          <RetellingPlayer exercise={currentExercise} onBack={handleBack} />
        </main>
      </div>
    );
  }

  // ========== PROJECTION & ARTICULATION MODES ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <ExerciseIntroModal categoryId={categoryId} onDismiss={() => setIntroForceOpen(false)} forceOpen={introForceOpen} />
      {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}

      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">
              {mode === "projection" ? "Projection Vocale" : "Articulation"}
            </span>
          </div>
          <button onClick={() => setIntroForceOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Exercise navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={prevExercise} disabled={currentExerciseIndex === 0 || isRecording}>
            ← Précédent
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            {currentExercise?.title} · {currentExerciseIndex + 1}/{category?.exercises.length}
          </span>
          <Button variant="ghost" size="sm" onClick={nextExercise} disabled={!category || currentExerciseIndex >= category.exercises.length - 1 || isRecording}>
            Suivant →
          </Button>
        </div>

        {/* Clinical tip */}
        {currentExercise?.tip && !isRecording && !showBilan && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Consigne :</strong> {currentExercise.tip}
              </p>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {/* ===== NOT RECORDING ===== */}
          {!isRecording && !showBilan && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Text to read */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">
                    {currentExercise?.text}
                  </p>
                </CardContent>
              </Card>

              {mode === "projection" && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4">
                    <Volume2 className="w-4 h-4" />
                    <span>Biofeedback de volume activé</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    5 secondes de calibration au démarrage, puis jauge de volume temps réel.
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  onClick={() => setShowCountdown(true)}
                >
                  <Mic className="w-5 h-5" />
                  Commencer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== RECORDING ===== */}
          {isRecording && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Text being read */}
              <Card>
                <CardContent className="p-6">
                  {mode === "articulation" && articulationItems.length > 1 ? (
                    <div className="space-y-4">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentItemIndex}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.2 }}
                          className="text-2xl md:text-3xl font-bold text-center text-foreground leading-relaxed min-h-[80px] flex items-center justify-center"
                        >
                          {articulationItems[currentItemIndex]}
                        </motion.p>
                      </AnimatePresence>
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentItemIndex(i => Math.max(0, i - 1))}
                          disabled={currentItemIndex === 0}
                        >
                          ← Précédent
                        </Button>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {currentItemIndex + 1} / {articulationItems.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentItemIndex(i => Math.min(articulationItems.length - 1, i + 1))}
                          disabled={currentItemIndex >= articulationItems.length - 1}
                        >
                          Suivant →
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">
                      {currentExercise?.text}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Volume gauge for projection mode */}
              {mode === "projection" && (
                <div className="flex justify-center">
                  <VolumeGauge
                    volumePercent={volumeBiofeedback.volumePercent}
                    zone={volumeBiofeedback.zone}
                    isCalibrated={volumeBiofeedback.isCalibrated}
                    calibrationProgress={volumeBiofeedback.calibrationProgress}
                    volumeLevel={volumeBiofeedback.volumeLevel}
                  />
                </div>
              )}

              {/* Timer + controls */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-speed-critical animate-pulse" />
                  <span className="font-mono tabular-nums">{formatTime(elapsedTime)}</span>
                </div>

                <Button
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                  onClick={stopProjectionRecording}
                >
                  <Square className="w-4 h-4" />
                  Terminer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== BILAN ===== */}
          {showBilan && (
            <motion.div
              key="bilan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
                  <motion.span
                    className="text-5xl block mb-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    {volumeBiofeedback.totalSpeakingTime > 0 &&
                    volumeBiofeedback.timeInTargetZone / volumeBiofeedback.totalSpeakingTime >= 0.7
                      ? "🎉"
                      : volumeBiofeedback.timeInTargetZone / Math.max(1, volumeBiofeedback.totalSpeakingTime) >= 0.4
                      ? "👍"
                      : "💪"}
                  </motion.span>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Bilan — {mode === "projection" ? "Projection Vocale" : "Articulation"}
                  </h2>
                </div>

                <CardContent className="p-6 space-y-4">
                  {mode === "projection" && volumeBiofeedback.baselineVolume > 0 && (
                    <>
                      {/* Volume stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-speed-calm/10 rounded-xl p-4 text-center"
                        >
                          <p className="text-2xl font-bold" style={{ color: "hsl(var(--speed-calm))" }}>
                            {Math.round((volumeBiofeedback.avgVolume / volumeBiofeedback.baselineVolume) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Volume moyen</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-primary/10 rounded-xl p-4 text-center"
                        >
                          <p className="text-2xl font-bold text-primary">
                            {Math.round((volumeBiofeedback.maxVolume / volumeBiofeedback.baselineVolume) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Volume max</p>
                        </motion.div>
                      </div>

                      {/* Target zone time */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-muted/50 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Temps en zone cible</span>
                          <span className="text-sm font-bold text-primary">
                            {Math.round(volumeBiofeedback.timeInTargetZone)}s / {Math.round(volumeBiofeedback.totalSpeakingTime)}s
                          </span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, (volumeBiofeedback.timeInTargetZone / Math.max(1, volumeBiofeedback.totalSpeakingTime)) * 100)}%`,
                            }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {volumeBiofeedback.timeInTargetZone / Math.max(1, volumeBiofeedback.totalSpeakingTime) >= 0.7
                            ? "🎯 Excellente projection ! Vous maintenez bien le volume."
                            : volumeBiofeedback.timeInTargetZone / Math.max(1, volumeBiofeedback.totalSpeakingTime) >= 0.4
                            ? "👍 Bon début, essayez de maintenir le volume plus longtemps."
                            : "💪 Le volume retombe souvent. Pensez à projeter depuis le ventre."}
                        </p>
                      </motion.div>
                    </>
                  )}

                  {/* Duration */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Durée : {formatTime(elapsedTime)}
                  </motion.p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBilan(false);
                    volumeBiofeedback.resetCalibration();
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer
                </Button>
                {category && currentExerciseIndex < category.exercises.length - 1 && (
                  <Button onClick={nextExercise} className="gap-2">
                    Exercice suivant →
                  </Button>
                )}
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Bibliothèque
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NeurologyTraining;
