import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, UserPlus, BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingChecklistProps {
  hasPatients: boolean;
  hasAssignedExercise: boolean;
  therapistCode: string | null;
}

const OnboardingChecklist = ({ hasPatients, hasAssignedExercise, therapistCode }: OnboardingChecklistProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    {
      id: "invite",
      label: "Inviter un patient",
      description: `Partagez votre Code Pro ${therapistCode || ""} par email`,
      done: hasPatients,
      icon: UserPlus,
      action: null,
    },
    {
      id: "assign",
      label: "Assigner un exercice",
      description: "Prescrivez un exercice depuis la fiche patient",
      done: hasAssignedExercise,
      icon: BookOpen,
      action: hasPatients ? () => navigate("/patient/list") : undefined,
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === 2;

  // Auto-dismiss once all done (with a delay for celebration)
  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

  if (dismissed) return null;

  const progressPercent = (completedCount / 2) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className={`rounded-xl border overflow-hidden ${
        allDone 
          ? "border-green-500/30 bg-green-500/5" 
          : "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent"
      }`}>
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {allDone ? (
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{completedCount}/3</span>
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold">
                {allDone ? "Bravo, vous êtes opérationnel ! 🎉" : "Premiers pas"}
              </p>
              <p className="text-xs text-muted-foreground">
                {allDone ? "Votre espace pro est configuré" : `${2 - completedCount} étape${2 - completedCount > 1 ? 's' : ''} restante${2 - completedCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="hidden sm:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allDone ? 'bg-green-500' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Steps */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        step.done
                          ? "bg-green-500/10"
                          : "bg-background border border-border"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {step.done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                      </div>
                      {!step.done && step.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-primary shrink-0"
                          onClick={step.action}
                        >
                          Faire →
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OnboardingChecklist;
