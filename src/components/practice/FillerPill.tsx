import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FillerPillProps {
  count: number;
  isRecording: boolean;
}

const getFillerStyle = (count: number): { bgColor: string; textColor: string } => {
  if (count === 0) {
    return { bgColor: "bg-muted", textColor: "text-muted-foreground" };
  }
  if (count <= 5) {
    return { bgColor: "bg-emerald-100 dark:bg-emerald-900/30", textColor: "text-emerald-600 dark:text-emerald-400" };
  }
  if (count <= 10) {
    return { bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-600 dark:text-orange-400" };
  }
  return { bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-600 dark:text-red-400" };
};

const FillerPill = ({ count, isRecording }: FillerPillProps) => {
  if (!isRecording) return null;
  
  const { bgColor, textColor } = getFillerStyle(count);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-help",
                bgColor,
                textColor
              )}
            >
              <span className="text-base">🙊</span>
              <span className="text-xs">Mots d'appui :</span>
              <motion.span
                key={count}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="tabular-nums font-bold"
              >
                {count}
              </motion.span>
            </motion.div>
          </AnimatePresence>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          <p>Nombre de mots d'appui ("euh", "du coup", "en fait"...) détectés pendant votre lecture.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FillerPill;
