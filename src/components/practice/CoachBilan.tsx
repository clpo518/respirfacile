import { motion } from "framer-motion";
import { generateCoachFeedback } from "@/lib/wpmUtils";

interface CoachBilanProps {
  avgWpm: number;
  maxWpm: number;
  targetWpm?: number;
  wordCount?: number;
  duration?: number;
  categoryId?: string;
  exerciseType?: string;
  exerciseTip?: string;
}

const CoachBilan = ({
  avgWpm,
  maxWpm,
  targetWpm,
  wordCount,
  duration,
  categoryId,
  exerciseTip
}: CoachBilanProps) => {
  const feedback = generateCoachFeedback(avgWpm, maxWpm, targetWpm, categoryId, exerciseTip);

  const stabilityColorClass = {
    excellent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    good: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
  };

  return (
    <div className="space-y-3">
      {/* Section 1: Verdict Principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-muted/50 border border-border"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{feedback.verdict.emoji}</span>
          <div className="flex-1">
            <h4 className={`font-semibold ${feedback.verdict.colorClass}`}>
              {feedback.verdict.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {feedback.verdict.description}
            </p>
            
            {/* Stats row */}
            {(wordCount !== undefined || duration !== undefined) && (
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                {wordCount !== undefined && wordCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{wordCount}</span> mots prononcés
                  </span>
                )}
                {duration !== undefined && duration > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span> de pratique
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section 2: Stabilité */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-4 rounded-xl border ${stabilityColorClass[feedback.stability.score]}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{feedback.stability.emoji}</span>
          <div className="flex-1">
            <h4 className="font-semibold">
              {feedback.stability.title}
            </h4>
            <p className="text-sm opacity-80 mt-1">
              {feedback.stability.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Conseil Contextuel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-primary/5 border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-primary">
              Conseil du Coach
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {feedback.contextualTip}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section 4: Rappel de l'exercice (if available) */}
      {feedback.exerciseReminder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-muted/30 border border-border"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">📝</span>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">
                Rappel de l'exercice
              </h4>
              <p className="text-sm text-muted-foreground mt-1 italic">
                "{feedback.exerciseReminder}"
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CoachBilan;
