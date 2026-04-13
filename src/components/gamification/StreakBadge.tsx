import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  justIncremented?: boolean;
}

export const StreakBadge = ({ currentStreak, longestStreak, justIncremented = false }: StreakBadgeProps) => {
  const isActive = currentStreak > 0;
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm cursor-pointer
            ${isActive 
              ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-500 border border-orange-500/30" 
              : "bg-muted text-muted-foreground border border-border"
            }
          `}
          initial={justIncremented ? { scale: 0.8 } : false}
          animate={justIncremented ? { 
            scale: [0.8, 1.2, 1],
          } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={() => setOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStreak}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <motion.div
                animate={isActive ? { 
                  rotate: [0, -10, 10, -10, 0],
                } : {}}
                transition={{ 
                  duration: 0.5, 
                  repeat: justIncremented ? 3 : 0,
                  delay: 0.2
                }}
              >
                <Flame className={`w-4 h-4 ${isActive ? "text-orange-500 fill-orange-500/30" : ""}`} />
              </motion.div>
              <span className="font-bold tabular-nums">{currentStreak}</span>
            </motion.div>
          </AnimatePresence>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isActive 
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/20" 
                  : "bg-muted"
              }`}>
                <Flame className={`w-5 h-5 ${isActive ? "text-orange-500 fill-orange-500/30" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Série de jours</p>
                <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
              </div>
            </div>
            {isMobile && (
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              {currentStreak > 0 
                ? `Bravo ! Vous vous êtes entraîné ${currentStreak} jour${currentStreak > 1 ? 's' : ''} de suite.`
                : "Entraînez-vous aujourd'hui pour démarrer une série !"
              }
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Record personnel</span>
              <span className="font-medium">{longestStreak} jour{longestStreak > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground/70 italic">
            💡 Revenir chaque jour augmente votre série !
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
