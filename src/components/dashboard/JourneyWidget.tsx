import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, BookOpen, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { JOURNEY_STEPS } from "@/data/journeyPath";

const JourneyWidget = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    loading,
    getValidatedExercises,
    isStepCompleted,
    isStepUnlocked,
    overallProgress,
  } = useJourneyProgress();

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeStep = JOURNEY_STEPS[currentStep];
  const activeValidated = getValidatedExercises(currentStep);
  const allCompleted = currentStep >= JOURNEY_STEPS.length - 1 && isStepCompleted(currentStep);

  const handleStartExercise = (stepIndex: number, categoryId: string) => {
    const step = JOURNEY_STEPS[stepIndex];
    const validated = getValidatedExercises(stepIndex);
    const nextExerciseId = step.exerciseIds.find((id) => !validated.includes(id)) || step.exerciseIds[0];
    navigate(`/practice?category=${categoryId}&exercise=${nextExerciseId}&journey_step=${stepIndex}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="py-5 px-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              Votre parcours
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={() => navigate("/library")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Mode libre
            </Button>
          </div>

          {/* Intro / Context block */}
          {currentStep === 0 && activeValidated.length === 0 ? (
            <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3.5 mb-4">
              <p className="text-sm font-semibold text-foreground mb-1.5">
                Apprenez à parler à votre rythme 🎯
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                8 étapes progressives, du plus simple au plus complexe. 
                Réussissez 3 exercices par étape pour débloquer la suivante.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Pas de chrono</span>
                <span className="mx-1">·</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>À votre rythme</span>
                <span className="mx-1">·</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Guidé pas à pas</span>
              </div>
            </div>
          ) : allCompleted ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3.5 mb-4 flex items-center gap-3"
            >
              <Trophy className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Parcours terminé ! 🏆</p>
                <p className="text-xs text-muted-foreground">Bravo, vous avez maîtrisé les 8 étapes. Continuez à pratiquer en mode libre.</p>
              </div>
            </motion.div>
          ) : (
            <p className="text-xs text-muted-foreground mb-2">
              {activeValidated.length === 0
                ? `Prochaine étape : ${activeStep.title.toLowerCase()}`
                : `${activeValidated.length}/${activeStep.requiredValidations} exercices réussis — continuez !`}
            </p>
          )}

          {/* Overall progress bar */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-1 relative">
              <Progress value={overallProgress} className="h-2.5" />
              {/* Step markers */}
              <div className="absolute inset-0 flex items-center pointer-events-none">
                {JOURNEY_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${((i + 1) / JOURNEY_STEPS.length) * 100}%` }}
                  >
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="w-px h-2.5 bg-background/60" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-primary tabular-nums whitespace-nowrap">
              {currentStep + (allCompleted ? 0 : 0)}/{JOURNEY_STEPS.length}
            </span>
          </div>

          {/* Active step CTA */}
          {!allCompleted && (
            <motion.button
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
              onClick={() => handleStartExercise(currentStep, activeStep.categoryId)}
              className="w-full flex items-center gap-3.5 p-4 mb-3 rounded-2xl bg-primary/10 border-2 border-primary/25 hover:border-primary/40 hover:bg-primary/15 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {activeStep.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    ÉTAPE {currentStep + 1}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {activeStep.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeValidated.length === 0
                    ? `Réussissez 3 exercices pour débloquer "${JOURNEY_STEPS[currentStep + 1]?.title || 'la suite'}"`
                    : `${activeValidated.length}/3 réussis — encore ${3 - activeValidated.length} pour débloquer la suite`}
                </p>
                {/* Exercise dots */}
                <div className="flex gap-1.5 mt-2">
                  {activeStep.exerciseIds.map((id) => (
                    <div
                      key={id}
                      className={`w-5 h-1.5 rounded-full transition-colors ${
                        activeValidated.includes(id)
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-primary-foreground text-primary-foreground ml-0.5" />
                </div>
              </div>
            </motion.button>
          )}

          {/* Steps list */}
          <div className="space-y-0.5">
            {JOURNEY_STEPS.map((step, index) => {
              const completed = isStepCompleted(index);
              const unlocked = isStepUnlocked(index);
              const isCurrent = index === currentStep;
              const validated = getValidatedExercises(index);

              if (isCurrent && !allCompleted) return null;

              return (
                <motion.div
                  key={step.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <button
                    disabled={!unlocked}
                    onClick={() => unlocked && handleStartExercise(index, step.categoryId)}
                    className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all text-left ${
                      completed
                        ? "hover:bg-primary/5"
                        : unlocked
                        ? "hover:bg-muted/60"
                        : "opacity-35 cursor-not-allowed"
                    }`}
                  >
                    {/* Step number / status */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      completed
                        ? "bg-primary/15 text-primary"
                        : !unlocked
                        ? "bg-muted text-muted-foreground/50"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {completed ? (
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      ) : !unlocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </div>

                    {/* Label + description */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm block truncate ${
                        completed
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </span>
                      {completed && (
                        <span className="text-[10px] text-primary/60">Terminé ✓</span>
                      )}
                    </div>

                    {/* Right: progress or arrow */}
                    {unlocked && !completed && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {validated.length}/{step.requiredValidations}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JourneyWidget;
