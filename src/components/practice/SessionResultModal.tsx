import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, RotateCcw, Loader2, Flame, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTargetLevelBySPS, getAdaptiveThresholds } from "@/lib/spsUtils";
import confetti from "canvas-confetti";
import SpeedGaugeBar from "./SpeedGaugeBar";
import SpeedComplianceBar from "./SpeedComplianceBar";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { JOURNEY_STEPS } from "@/data/journeyPath";
import { analyzeClutteringProfile } from "@/lib/clutteringProfile";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";

interface WpmDataPoint {
  timestamp: number;
  wpm: number;
}

interface LatencyStats {
  totalQuestions: number;
  pausesRespected: number;
  latencyTimes?: number[]; // actual wait time in seconds per question
}

interface SessionResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avgSps: number;
  targetSps: number;
  syllableCount: number;
  sessionId?: string;
  onContinue: () => void;
  onRetry: () => void;
  actualSpeakingTime?: number;
  totalSessionTime?: number;
  streakIncremented?: boolean;
  goalJustCompleted?: boolean;
  currentStreak?: number;
  todayMinutes?: number;
  dailyGoal?: number;
  goalProgress?: number;
  journeyStep?: number | null;
  exerciseId?: string;
  wpmData?: WpmDataPoint[];
  latencyStats?: LatencyStats;
  wordTimestamps?: WordTimestamp[];
}

const getPerformanceLevel = (avgSps: number, targetSps: number): {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} => {
  if (avgSps === 0) {
    return {
      title: "Séance terminée",
      subtitle: "Réessayez en parlant un peu plus fort",
      icon: <AlertTriangle className="w-10 h-10" />,
      color: "text-muted-foreground",
      bgColor: "bg-muted"
    };
  }

  const diff = avgSps - targetSps;
  const { good, bad } = getAdaptiveThresholds(targetSps);

  if (diff >= -good && diff <= good) {
    return {
      title: "Bravo ! 🎯",
      subtitle: "Vous êtes pile dans votre objectif",
      icon: <CheckCircle2 className="w-10 h-10" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
    };
  }
  if (diff > good && diff <= bad) {
    return {
      title: "Presque ! ⚡",
      subtitle: "Juste un peu au-dessus — vous y êtes presque",
      icon: <TrendingUp className="w-10 h-10" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    };
  }
  if (diff > bad) {
    return {
      title: "On ralentit ensemble 🌬️",
      subtitle: "Pensez à respirer entre les phrases",
      icon: <AlertTriangle className="w-10 h-10" />,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    };
  }
  if (diff < -good && diff >= -bad) {
    return {
      title: "Très bien ! ✨",
      subtitle: "Beau contrôle, juste en dessous de la cible",
      icon: <CheckCircle2 className="w-10 h-10" />,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    };
  }
  return {
    title: "Rythme très posé 🐢",
    subtitle: "Vous avez bien le contrôle — accélérez quand vous vous sentez prêt",
    icon: <TrendingUp className="w-10 h-10" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  };
};

/**
 * Personalized encouragement messages based on context
 */
const getEncouragementMessage = (
  avgSps: number,
  targetSps: number,
  currentStreak: number,
  streakIncremented: boolean,
  goalJustCompleted: boolean,
  dailyGoal: number,
): string => {
  if (avgSps === 0) return "Pas de souci — réessayez en parlant un peu plus fort, on est là pour ça 💪";

  const diff = avgSps - targetSps;
  const { good } = getAdaptiveThresholds(targetSps);
  const onTarget = diff >= -good && diff <= good;

  // Streak milestones
  if (streakIncremented && currentStreak >= 7) {
    return `🔥 ${currentStreak} jours consécutifs ! Votre régularité est impressionnante. Continuez, les progrès sont là !`;
  }
  if (streakIncremented && currentStreak >= 3) {
    return `💪 ${currentStreak} jours de suite ! La constance est la clé du progrès.`;
  }

  // Goal completed
  if (goalJustCompleted) {
    if (diff > good) {
      return "🎉 Vos " + dailyGoal + " minutes quotidiennes sont faites ! Essayez maintenant de ralentir le débit.";
    }
    return "🎉 Vos " + dailyGoal + " minutes quotidiennes sont faites ! Continuez comme ça.";
  }

  // Performance-based
  if (onTarget) {
    return "Vous maîtrisez votre rythme, bravo ! Essayez de garder cette régularité au quotidien.";
  }
  if (diff > good) {
    return "Respirez entre les phrases — chaque pause est un moment de contrôle gagné.";
  }
  return "Vous contrôlez bien votre débit. Accélérez progressivement quand vous vous sentez prêt.";
};

type Sentiment = "too_slow" | "comfortable" | "too_fast";

const SENTIMENTS: { value: Sentiment; emoji: string; label: string }[] = [
  { value: "too_slow", emoji: "🐢", label: "Plutôt lent" },
  { value: "comfortable", emoji: "✅", label: "À l'aise" },
  { value: "too_fast", emoji: "🐇", label: "Plutôt rapide" },
];

const SessionResultModal = ({
  open,
  onOpenChange,
  avgSps,
  targetSps,
  syllableCount,
  sessionId,
  onContinue,
  onRetry,
  actualSpeakingTime,
  totalSessionTime,
  streakIncremented,
  goalJustCompleted,
  currentStreak = 0,
  todayMinutes = 0,
  dailyGoal = 3,
  goalProgress = 0,
  journeyStep,
  exerciseId,
  wpmData,
  latencyStats,
  wordTimestamps,
}: SessionResultModalProps) => {
  const performance = getPerformanceLevel(avgSps, targetSps);
  const targetLevel = getTargetLevelBySPS(targetSps);
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | null>(null);
  const [savingSentiment, setSavingSentiment] = useState(false);
  const [journeyResult, setJourneyResult] = useState<{
    validated: boolean;
    stepAdvanced: boolean;
    remaining: number;
    nextStepName?: string;
  } | null>(null);

  const journey = useJourneyProgress();

  const clutteringProfile = useMemo(
    () => analyzeClutteringProfile(wordTimestamps, targetSps),
    [wordTimestamps, targetSps],
  );

  const isJourneyMode = journeyStep !== null && journeyStep !== undefined && exerciseId;

  const encouragement = getEncouragementMessage(
    avgSps, targetSps, currentStreak, !!streakIncremented, !!goalJustCompleted, dailyGoal
  );

  // Trigger confetti for goal completion or on-target performance
  useEffect(() => {
    if (!open || avgSps === 0) return;
    
    const { good } = getAdaptiveThresholds(targetSps);
    const diff = avgSps - targetSps;
    const onTarget = diff >= -good && diff <= good;

    if (goalJustCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#6EE7B7'],
      });
    } else if (onTarget) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6'],
      });
    }
  }, [open, goalJustCompleted, avgSps, targetSps]);

  // Journey validation
  useEffect(() => {
    if (!open || !isJourneyMode || !sessionId || avgSps === 0) return;

    const ratio = avgSps / targetSps;
    const isInGreenZone = ratio >= 0.5 && ratio <= 1.2;

    if (isInGreenZone) {
      journey.validateExercise(journeyStep!, exerciseId!, sessionId).then((result) => {
        const step = JOURNEY_STEPS[journeyStep!];
        const validated = journey.getValidatedExercises(journeyStep!);
        const remaining = step.requiredValidations - validated.length - 1; // -1 for this one
        const nextStep = JOURNEY_STEPS[journeyStep! + 1];

        setJourneyResult({
          validated: true,
          stepAdvanced: result.stepAdvanced,
          remaining: Math.max(0, remaining),
          nextStepName: nextStep?.title,
        });
      });
    } else {
      setJourneyResult({
        validated: false,
        stepAdvanced: false,
        remaining: 0,
      });
    }
  }, [open, isJourneyMode, sessionId, avgSps, targetSps]);

  const handleSentimentSelect = async (sentiment: Sentiment) => {
    setSelectedSentiment(sentiment);
    
    if (!sessionId) return;
    
    setSavingSentiment(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ patient_sentiment: sentiment })
        .eq("id", sessionId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error saving sentiment:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingSentiment(false);
    }
  };

  const goalCompleted = goalProgress >= 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto pb-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Votre séance</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Performance Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl ${performance.bgColor}`}
          >
            <div className={performance.color}>{performance.icon}</div>
            <h3 className={`text-lg font-bold mt-2 ${performance.color}`}>
              {performance.title}
            </h3>
            <p className="text-xs text-muted-foreground">{performance.subtitle}</p>
          </motion.div>

          {/* Encouragement Message */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-3"
          >
            <p className="text-sm text-center text-foreground leading-relaxed">
              {encouragement}
            </p>
          </motion.div>

          {/* Journey Progress Feedback */}
          {isJourneyMode && journeyResult && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18 }}
              className={`rounded-xl p-4 border ${
                journeyResult.validated
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/50 border-border"
              }`}
            >
              {journeyResult.validated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {journeyResult.stepAdvanced
                          ? "🎉 Nouvelle étape débloquée !"
                          : "✅ Exercice validé !"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {journeyResult.stepAdvanced
                          ? journeyResult.nextStepName
                            ? `Direction : ${journeyResult.nextStepName}`
                            : "Parcours terminé — bravo champion ! 🏆"
                          : journeyResult.remaining === 1
                          ? "Plus qu'un seul exercice pour la suite !"
                          : `Encore ${journeyResult.remaining} exercices pour avancer`}
                      </p>
                    </div>
                  </div>
                  {/* Mini step progress bar */}
                  {journeyStep !== null && journeyStep !== undefined && JOURNEY_STEPS[journeyStep] && (
                    <div className="flex gap-1.5">
                      {JOURNEY_STEPS[journeyStep].exerciseIds.map((id, i) => {
                        const isValidated = journeyResult.stepAdvanced || 
                          i < (JOURNEY_STEPS[journeyStep!].requiredValidations - journeyResult.remaining);
                        return (
                          <div
                            key={id}
                            className={`flex-1 h-1.5 rounded-full transition-all ${
                              isValidated ? "bg-primary" : "bg-border"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Pas encore dans la zone verte
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Réessayez en ralentissant — vous y êtes presque ! 💪
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Latency Compliance Stats */}
          {latencyStats && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">⏱️ Pauses respectées</span>
                <span className={`text-sm font-bold ${
                  latencyStats.pausesRespected === latencyStats.totalQuestions
                    ? "text-emerald-600"
                    : latencyStats.pausesRespected >= latencyStats.totalQuestions / 2
                    ? "text-amber-600"
                    : "text-destructive"
                }`}>
                  {latencyStats.pausesRespected}/{latencyStats.totalQuestions}
                </span>
              </div>
              {latencyStats.latencyTimes ? (
                <div className="flex gap-1.5 items-end">
                  {latencyStats.latencyTimes.map((time, i) => {
                    const ratio = Math.min(time / 5, 1.2);
                    const isOk = time >= 2;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-muted-foreground tabular-nums">{time}s</span>
                        <div
                          className={`w-full rounded-full ${isOk ? "bg-emerald-500" : "bg-destructive/50"}`}
                          style={{ height: `${Math.max(ratio * 24, 4)}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-1.5">
                  {Array.from({ length: latencyStats.totalQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < latencyStats.pausesRespected
                          ? "bg-emerald-500"
                          : "bg-destructive/40"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-2">
                {latencyStats.pausesRespected === latencyStats.totalQuestions
                  ? "Parfait ! Vous avez marqué une pause avant chaque réponse 👏"
                  : latencyStats.pausesRespected >= latencyStats.totalQuestions / 2
                  ? "Bon effort ! Imposez-vous 2 à 5s de pause à chaque question."
                  : "Le but est de s'imposer une pause de 2 à 5 secondes — ça viendra avec la pratique !"}
              </p>
            </motion.div>
          )}

          {/* Gamification Row: Streak + Daily Goal */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6"
          >
            {/* Streak */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={streakIncremented ? { scale: 0.5 } : false}
                animate={streakIncremented ? { scale: [0.5, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStreak > 0
                    ? "bg-gradient-to-br from-orange-400/20 to-red-400/20"
                    : "bg-muted"
                }`}
              >
                <Flame className={`w-5 h-5 ${currentStreak > 0 ? "text-orange-500 fill-orange-500/30" : "text-muted-foreground"}`} />
              </motion.div>
              <div>
                <p className="text-lg font-bold leading-none">{currentStreak}</p>
                <p className="text-[10px] text-muted-foreground">jour{currentStreak > 1 ? 's' : ''} de suite</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-border" />

            {/* Daily Goal */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={goalJustCompleted ? { scale: 0.5 } : false}
                animate={goalJustCompleted ? { scale: [0.5, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  goalCompleted
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-muted"
                }`}
              >
                <Target className={`w-5 h-5 ${goalCompleted ? "text-emerald-500" : "text-muted-foreground"}`} />
              </motion.div>
              <div>
                <p className="text-lg font-bold leading-none">
                  {todayMinutes}<span className="text-xs font-normal text-muted-foreground">/{dailyGoal}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {goalCompleted ? "✅ Objectif atteint" : "min aujourd'hui"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Visual Speed Gauge */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="px-2"
          >
            <SpeedGaugeBar sps={avgSps} targetSps={targetSps} />
            <p className="text-xs text-center text-muted-foreground mt-3">
              Objectif : Niveau {targetLevel.level} ({targetLevel.label})
            </p>
          </motion.div>

          {/* Speed Compliance Bar */}
          {wpmData && wpmData.length > 2 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.27 }}
              className="px-2"
            >
              <SpeedComplianceBar wpmData={wpmData} targetSps={targetSps} wordTimestamps={wordTimestamps} />
            </motion.div>
          )}

          {/* Cluttering Feedback */}
          {clutteringProfile && clutteringProfile.severity !== "none" && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
              className={`rounded-xl border p-3 space-y-2 ${
                clutteringProfile.severity === "severe"
                  ? "bg-destructive/5 border-destructive/20"
                  : clutteringProfile.severity === "moderate"
                  ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                  : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">
                  {clutteringProfile.severity === "severe" ? "🔴" : clutteringProfile.severity === "moderate" ? "🟠" : "🟡"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {clutteringProfile.burstCount > 0 && (
                      <>{clutteringProfile.burstCount} moment{clutteringProfile.burstCount > 1 ? "s" : ""} d'accélération</>
                    )}
                    {clutteringProfile.burstCount > 0 && clutteringProfile.pauseDeficit && " · "}
                    {clutteringProfile.pauseDeficit && "Pauses trop courtes"}
                    {(clutteringProfile.burstCount > 0 || clutteringProfile.pauseDeficit) && clutteringProfile.telescopingDetected && " · "}
                    {clutteringProfile.telescopingDetected && "Syllabes avalées"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clutteringProfile.patientSummary}
                  </p>
                </div>
              </div>
              {/* Mini stats */}
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                {clutteringProfile.burstCount > 0 && (
                  <span>⚡ {clutteringProfile.burstPercentage}% en burst</span>
                )}
                {clutteringProfile.averageGap !== null && (
                  <span>⏱️ {Math.round(clutteringProfile.averageGap * 1000)}ms entre mots</span>
                )}
                {clutteringProfile.rateCV !== null && (
                  <span>📊 CV {clutteringProfile.rateCV}</span>
                )}
              </div>
            </motion.div>
          )}

          {(syllableCount > 0 || (actualSpeakingTime !== undefined && totalSessionTime && totalSessionTime > 0)) && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-center text-xs text-muted-foreground space-y-1"
            >
              {syllableCount > 0 && (
                <p><span className="font-medium text-foreground">{syllableCount}</span> syllabes prononcées</p>
              )}
              {actualSpeakingTime !== undefined && totalSessionTime && totalSessionTime > 0 && (
                <p>
                  Vous avez parlé{' '}
                  <span className="font-medium text-foreground">
                    {Math.floor(actualSpeakingTime / 60)}:{String(Math.floor(actualSpeakingTime % 60)).padStart(2, '0')}
                  </span>
                  {' sur '}
                  <span className="font-medium text-foreground">
                    {Math.floor(totalSessionTime / 60)}:{String(Math.floor(totalSessionTime % 60)).padStart(2, '0')}
                  </span>
                  {' — le reste était des pauses'}
                </p>
              )}
            </motion.div>
          )}

          {/* Patient Sentiment */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <p className="text-sm text-center text-muted-foreground">
              Comment vous êtes-vous senti(e) ?
            </p>
            <div className="flex justify-center gap-3">
              {SENTIMENTS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => handleSentimentSelect(value)}
                  disabled={savingSentiment}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selectedSentiment === value
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${savingSentiment ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs mt-1 text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
            {savingSentiment && (
              <div className="flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex gap-3"
          >
            <Button 
              onClick={onRetry}
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isJourneyMode && journeyResult && !journeyResult.validated
                ? "Réessayer"
                : "Recommencer"}
            </Button>
            <Button 
              variant="outline"
              onClick={onContinue}
              className="flex-1 gap-2"
            >
              {isJourneyMode && journeyResult?.validated
                ? "Continuer le parcours"
                : "Voir mon bilan"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionResultModal;
