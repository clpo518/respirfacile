import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, ArrowLeft, RotateCcw, ChevronRight, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useDeepgramSPS } from "@/hooks/useDeepgramSPS";
import { useVolumeAnalyzer } from "@/hooks/useVolumeAnalyzer";
import { getNormSPS, getAgeGroupLabel, validateBirthYear, getAgeGroup } from "@/lib/ageNormsUtils";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const DURATION_SECONDS = 30;
const MIN_DURATION = 15;

// --- Interpretations cliniques adaptées au diagnostic ---
function getDiagnosticInterpretation(avgSps: number, normSps: number) {
  const diff = avgSps - normSps;

  if (diff > 1.0) {
    return {
      title: "Débit rapide",
      emoji: "⚡",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/sec est significativement au-dessus de la moyenne pour votre âge (${normSps.toFixed(1)} syll/sec). Cela peut être un signe de bredouillement ou de tachylalie.`,
      detail: "L'entraînement régulier peut vous aider à mieux contrôler votre rythme de parole et à gagner en clarté.",
      severity: "high" as const,
    };
  }
  if (diff > 0) {
    return {
      title: "Légèrement rapide",
      emoji: "🔶",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/sec est légèrement au-dessus de la norme (${normSps.toFixed(1)} syll/sec).`,
      detail: "Avec quelques exercices ciblés, vous pouvez gagner en clarté et en confort de parole.",
      severity: "medium" as const,
    };
  }
  if (diff >= -0.5) {
    return {
      title: "Débit normal",
      emoji: "✅",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/sec est dans la norme pour votre âge (${normSps.toFixed(1)} syll/sec).`,
      detail: "Vous pouvez tout de même vous entraîner pour gagner en aisance dans des situations variées.",
      severity: "normal" as const,
    };
  }
  return {
    title: "Débit contrôlé",
    emoji: "🐢",
    description: `Votre débit de ${avgSps.toFixed(1)} syll/sec est en dessous de la norme (${normSps.toFixed(1)} syll/sec).`,
    detail: "L'application peut vous aider à maintenir cette maîtrise et à vous adapter à différents contextes de parole.",
    severity: "normal" as const,
  };
}

// --- Volume visualisation bars ---
function VolumeBars({ volume }: { volume: number }) {
  const bars = 12;
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const height = Math.max(8, volume * 64 * (1 - distFromCenter * 0.5) + Math.random() * 6);
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-primary"
            animate={{ height: `${height}px`, opacity: 0.4 + volume * 0.6 }}
            transition={{ duration: 0.08 }}
          />
        );
      })}
    </div>
  );
}

// --- Gauge for results ---
function ResultGauge({ value, norm, max = 8 }: { value: number; norm: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const normPct = Math.min((norm / max) * 100, 100);

  return (
    <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
      {/* Norm marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
        style={{ left: `${normPct}%` }}
      />
      <div
        className="absolute -top-5 text-xs font-medium text-primary"
        style={{ left: `${normPct}%`, transform: "translateX(-50%)" }}
      >
        Norme
      </div>
      {/* Value bar */}
      <motion.div
        className="h-full rounded-full"
        style={{
          background:
            value > norm + 1
              ? "hsl(var(--speed-critical))"
              : value > norm
              ? "hsl(var(--speed-fast))"
              : "hsl(var(--speed-calm))",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Diagnostic = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [birthYear, setBirthYear] = useState("");
  const [birthYearError, setBirthYearError] = useState<string | null>(null);
  const [normSps, setNormSps] = useState(5.0);
  const [ageLabel, setAgeLabel] = useState("Adulte");
  const [countdown, setCountdown] = useState(DURATION_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [finalSps, setFinalSps] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number>(0);
  const deepgramReadyRef = useRef<boolean>(false);
  const stoppingRef = useRef<boolean>(false);

  const deepgram = useDeepgramSPS();
  const volume = useVolumeAnalyzer();

  // --- Step 1: Validate birth year ---
  const handleBirthYearChange = (val: string) => {
    setBirthYear(val);
    setBirthYearError(null);
    const year = parseInt(val, 10);
    if (val.length === 4 && !isNaN(year)) {
      const validation = validateBirthYear(year);
      if (validation.valid) {
        setNormSps(getNormSPS(year));
        setAgeLabel(getAgeGroupLabel(year));
      } else {
        setBirthYearError(validation.error || null);
      }
    }
  };

  const canProceedStep1 = () => {
    const year = parseInt(birthYear, 10);
    if (isNaN(year) || birthYear.length !== 4) return false;
    return validateBirthYear(year).valid;
  };

  // --- Step 3: Recording ---
  const startRecording = useCallback(async () => {
    setMicError(null);
    deepgramReadyRef.current = false;
    stoppingRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: true, noiseSuppression: true, echoCancellation: false }
      });
      streamRef.current = stream;

      volume.startAnalyzing(stream);

      // Start deepgram — track success
      try {
        await deepgram.start(stream, { detectFillers: true });
        deepgramReadyRef.current = true;
      } catch (e) {
        console.warn("Deepgram init failed:", e);
        deepgramReadyRef.current = false;
      }

      setIsRecording(true);
      recordingStartRef.current = Date.now();
      setCountdown(DURATION_SECONDS);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        const remaining = Math.max(0, DURATION_SECONDS - elapsed);
        setCountdown(remaining);
        if (remaining <= 0) {
          stopRecording();
        }
      }, 250);
    } catch (err) {
      console.error("Mic access error:", err);
      setMicError("Impossible d'accéder au microphone. Vérifiez les permissions de votre navigateur.");
    }
  }, [deepgram, volume]);

  // Use a ref to always access the latest deepgram values
  const deepgramRef = useRef(deepgram);
  deepgramRef.current = deepgram;

  const stopRecording = useCallback(() => {
    // Prevent double-stop
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    volume.stopAnalyzing();
    deepgramRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);

    // If deepgram never connected, skip analysis and show error
    if (!deepgramReadyRef.current) {
      setFinalSps(0);
      setStep(4);
      return;
    }

    // Show analyzing animation then results
    setShowAnalyzing(true);
    setTimeout(() => {
      const dg = deepgramRef.current;
      // Calculate average SPS from history
      const history = dg.spsHistory.filter((s) => s > 0);
      const totalSyllables = dg.syllableCount;
      const speakingTime = dg.actualSpeakingTime;

      let avg = 0;
      if (speakingTime > 0 && totalSyllables > 0) {
        avg = Math.round((totalSyllables / speakingTime) * 10) / 10;
      } else if (history.length > 0) {
        avg = Math.round((history.reduce((a, b) => a + b, 0) / history.length) * 10) / 10;
      }

      setFinalSps(avg);
      setShowAnalyzing(false);
      setStep(4);
    }, 1800);
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const elapsedSeconds = DURATION_SECONDS - countdown;
  const canStop = elapsedSeconds >= MIN_DURATION;

  const interpretation = getDiagnosticInterpretation(finalSps, normSps);

  const resetDiagnostic = () => {
    deepgram.reset();
    stoppingRef.current = false;
    deepgramReadyRef.current = false;
    setStep(1);
    setBirthYear("");
    setCountdown(DURATION_SECONDS);
    setFinalSps(0);
    setMicError(null);
    setShowAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-primary" : s < step ? "w-6 bg-primary/40" : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ========== STEP 1: Age ========== */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-3xl">🎙️</div>
                      <h1 className="text-2xl font-bold text-foreground">Diagnostic vocal gratuit</h1>
                      <p className="text-muted-foreground">
                        Mesurez votre vitesse de parole en 30 secondes.
                        <br />
                        Résultat immédiat, aucune inscription requise.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="birthYear" className="text-sm font-medium">
                        Année de naissance
                      </Label>
                      <Input
                        id="birthYear"
                        type="number"
                        placeholder="ex: 1995"
                        value={birthYear}
                        onChange={(e) => handleBirthYearChange(e.target.value)}
                        className="text-center text-lg"
                        min={1920}
                        max={new Date().getFullYear() - 5}
                      />
                      {birthYearError && (
                        <p className="text-sm text-destructive">{birthYearError}</p>
                      )}
                      <p className="text-xs text-muted-foreground text-center">
                        Cette info permet d'adapter l'analyse à votre profil.
                      </p>
                    </div>

                    {canProceedStep1() && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-secondary rounded-lg p-4 text-center space-y-1"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {getAgeGroup(parseInt(birthYear)).emoji} Profil : {ageLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Norme clinique : <span className="font-semibold text-primary">{normSps} syll/sec</span>
                        </p>
                      </motion.div>
                    )}

                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1()}
                      className="w-full"
                      size="lg"
                    >
                      Continuer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 2: Preparation ========== */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-3xl">📋</div>
                      <h2 className="text-xl font-bold text-foreground">Comment ça marche</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="font-medium text-foreground">Vous allez parler librement pendant 30 secondes</p>
                          <p className="text-sm text-muted-foreground">Pas de texte à lire, pas de piège.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="font-medium text-foreground">Racontez-nous quelque chose</p>
                          <p className="text-sm text-muted-foreground">
                            Vos dernières vacances, un souvenir agréable, ou ce que vous avez fait ce week-end.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="font-medium text-foreground">On mesure votre vitesse de parole</p>
                          <p className="text-sm text-muted-foreground">
                            En syllabes par seconde — c'est la mesure utilisée en orthophonie.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-accent-foreground">
                        Votre audio n'est ni enregistré ni stocké. L'analyse est instantanée et confidentielle.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => { setStep(3); startRecording(); }} className="flex-1" size="lg">
                        <Mic className="mr-2 h-4 w-4" /> Je suis prêt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 3: Recording ========== */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {micError ? (
                      <div className="text-center space-y-4">
                        <div className="text-4xl">🎤</div>
                        <p className="text-destructive font-medium">{micError}</p>
                        <p className="text-sm text-muted-foreground">
                          Autorisez l'accès au microphone dans les paramètres de votre navigateur, puis réessayez.
                        </p>
                        <Button onClick={() => { setMicError(null); startRecording(); }}>
                          Réessayer
                        </Button>
                      </div>
                    ) : showAnalyzing ? (
                      <div className="text-center space-y-4 py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="h-10 w-10 text-primary mx-auto" />
                        </motion.div>
                        <p className="text-lg font-medium text-foreground">Analyse en cours...</p>
                        <p className="text-sm text-muted-foreground">Calcul de votre vitesse de parole</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <motion.div
                            className="text-5xl font-bold tabular-nums text-primary"
                            key={countdown}
                            initial={{ scale: 1.15, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {countdown}
                          </motion.div>
                          <p className="text-sm text-muted-foreground">secondes restantes</p>
                        </div>

                        {/* Volume animation */}
                        <VolumeBars volume={volume.volumeLevel} />

                        {/* Recording indicator */}
                        <div className="flex items-center justify-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {volume.isSpeaking ? "C'est très bien, continuez..." : "Parlez naturellement..."}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <Progress value={(elapsedSeconds / DURATION_SECONDS) * 100} className="h-2" />

                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          disabled={!canStop}
                          className="w-full"
                        >
                          {canStop
                            ? "Terminer le test"
                            : `Minimum ${MIN_DURATION - elapsedSeconds}s encore...`}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== STEP 4: Results ========== */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {finalSps === 0 ? (
                      /* No speech detected */
                      <div className="text-center space-y-4">
                        <div className="text-4xl">🤔</div>
                        <h2 className="text-xl font-bold text-foreground">Aucune parole détectée</h2>
                        <p className="text-muted-foreground">
                          Nous n'avons pas détecté de parole. Vérifiez votre micro et réessayez.
                        </p>
                        <Button onClick={resetDiagnostic}>
                          <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-1">
                          <div className="text-4xl">{interpretation.emoji}</div>
                          <h2 className="text-xl font-bold text-foreground">{interpretation.title}</h2>
                        </div>

                        {/* Big SPS number */}
                        <div className="text-center">
                          <motion.div
                            className="text-5xl font-bold text-primary"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                          >
                            {finalSps.toFixed(1)}
                          </motion.div>
                          <p className="text-sm text-muted-foreground mt-1">syllabes / seconde</p>
                        </div>

                        {/* Gauge */}
                        <div className="pt-4">
                          <ResultGauge value={finalSps} norm={normSps} />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Lent</span>
                            <span>Votre norme : {normSps} syll/s ({ageLabel})</span>
                            <span>Rapide</span>
                          </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-secondary rounded-lg p-4 space-y-2">
                          <p className="text-sm text-foreground">{interpretation.description}</p>
                          <p className="text-sm text-muted-foreground">{interpretation.detail}</p>
                        </div>

                        {/* Filler words */}
                        {deepgram.fillerCount > 0 && (
                          <div className="bg-accent/50 rounded-lg p-4">
                            <p className="text-sm text-accent-foreground">
                              <span className="font-medium">Mots tics détectés : {deepgram.fillerCount}</span>
                              {" — "}
                              {Object.entries(deepgram.fillerDetails)
                                .map(([word, count]) => `"${word}" (${count}×)`)
                                .join(", ")}
                            </p>
                          </div>
                        )}

                        {/* CTAs */}
                        <div className="space-y-3 pt-2">
                          <Button
                            onClick={() => navigate("/auth")}
                            className="w-full"
                            size="lg"
                          >
                            Commencer mon entraînement <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => navigate("/assessment")}
                            variant="outline"
                            className="w-full"
                          >
                            Faire le test écrit aussi
                          </Button>
                          <p className="text-center text-xs text-muted-foreground">
                            Gratuit · 5 minutes par jour · Résultats en 2 semaines
                          </p>
                        </div>

                        <div className="text-center">
                          <button
                            onClick={resetDiagnostic}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                          >
                            <RotateCcw className="inline h-3 w-3 mr-1" />
                            Refaire le test
                          </button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Diagnostic;
