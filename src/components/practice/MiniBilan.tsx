import { getSpeedFeedback } from "@/lib/wpmUtils";
import { motion } from "framer-motion";

interface MiniBilanProps {
  avgWpm: number;
  wordCount?: number;
  duration?: number;
  compact?: boolean;
}

const MiniBilan = ({ avgWpm, wordCount, duration, compact = false }: MiniBilanProps) => {
  const feedback = getSpeedFeedback(avgWpm);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${feedback.colorClass}`}>
        <span className="text-lg">{feedback.emoji}</span>
        <span className="text-sm font-medium">{feedback.title}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-muted/50 border border-border"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{feedback.emoji}</span>
        <div className="flex-1">
          <h4 className={`font-semibold ${feedback.colorClass}`}>
            {feedback.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {feedback.description}
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
  );
};

export default MiniBilan;
