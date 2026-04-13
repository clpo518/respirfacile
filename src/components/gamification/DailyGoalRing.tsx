import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Target, X } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface DailyGoalRingProps {
  todayMinutes: number;
  dailyGoal: number;
  goalProgress: number; // 0-100
  goalCompleted: boolean;
  justCompleted?: boolean;
}

export const DailyGoalRing = ({ 
  todayMinutes, 
  dailyGoal, 
  goalProgress, 
  goalCompleted,
  justCompleted = false 
}: DailyGoalRingProps) => {
  const hasTriggeredConfetti = useRef(false);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Trigger confetti when goal is just completed
  useEffect(() => {
    if (justCompleted && goalCompleted && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      
      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#6EE7B7'],
      });
    }
  }, [justCompleted, goalCompleted]);

  // Reset confetti flag when goal resets (new day)
  useEffect(() => {
    if (!goalCompleted) {
      hasTriggeredConfetti.current = false;
    }
  }, [goalCompleted]);

  // SVG ring properties
  const size = 44;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalProgress / 100) * circumference;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button 
          className="relative flex items-center justify-center cursor-pointer"
          initial={justCompleted ? { scale: 0.8 } : false}
          animate={justCompleted ? { scale: [0.8, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={() => setOpen(true)}
        >
          {/* Background ring */}
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Progress ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={goalCompleted ? "#10B981" : "#3B82F6"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          
          {/* Center icon/text */}
          <div className="absolute inset-0 flex items-center justify-center">
            {goalCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Check className="w-5 h-5 text-emerald-500" />
              </motion.div>
            ) : (
              <span className="text-xs font-bold tabular-nums text-foreground">
                {todayMinutes}
              </span>
            )}
          </div>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        side={isMobile ? "bottom" : "bottom"} 
        align="center"
        className="w-64 p-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Objectif du jour</span>
            </div>
            {isMobile && (
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              <svg width={80} height={80} className="transform -rotate-90">
                <circle
                  cx={40}
                  cy={40}
                  r={35}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  className="text-muted/30"
                />
                <motion.circle
                  cx={40}
                  cy={40}
                  r={35}
                  fill="none"
                  stroke={goalCompleted ? "#10B981" : "#3B82F6"}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 35}
                  initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - goalProgress / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{todayMinutes}</span>
                <span className="text-xs text-muted-foreground">/ {dailyGoal} min</span>
              </div>
            </div>
          </div>
          
          <div className={`p-2 rounded-lg text-center text-sm ${
            goalCompleted 
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" 
              : "bg-muted text-muted-foreground"
          }`}>
            {goalCompleted 
              ? "✅ Objectif atteint ! Bravo !" 
              : `Encore ${dailyGoal - todayMinutes} min pour atteindre l'objectif`
            }
          </div>
          
          <p className="text-[10px] text-muted-foreground/70 italic text-center">
            💡 3 min/jour suffisent pour progresser !
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
