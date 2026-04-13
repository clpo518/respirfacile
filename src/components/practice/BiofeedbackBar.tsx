import { motion, AnimatePresence } from "framer-motion";
import { Square, Pause, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect, useRef } from "react";
import FillerPill from "./FillerPill";
import { getSPSZone } from "@/lib/spsUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BiofeedbackBarProps {
  sps: number;
  targetSps: number;
  isRecording: boolean;
  isPaused?: boolean;
  isCalibrated?: boolean;
  onStop: () => void;
  onTogglePause?: () => void;
  disabled?: boolean;
  fillerCount?: number;
}

// Debounce delay to stabilize feedback changes (ms)
const FEEDBACK_DEBOUNCE_MS = 600;
// Minimum SPS to consider as "speaking" (filter out noise)
const MIN_SPEAKING_SPS = 0.3;

const BiofeedbackBar = ({ 
  sps, 
  targetSps,
  isRecording, 
  isPaused = false,
  isCalibrated = true,
  onStop, 
  onTogglePause,
  disabled = false,
  fillerCount
}: BiofeedbackBarProps) => {
  // Debounced state to reduce UI flickering
  const [stableState, setStableState] = useState<{
    label: string;
    colorClass: string;
    bgClass: string;
    emoji: string;
  }>({
    label: "Parlez...",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
    emoji: "🎤"
  });
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastChangeTime = useRef<number>(0);

  // Calculate current state based on SPS
  const currentState = useMemo(() => {
    if (isPaused) {
      return { 
        label: "En pause", 
        colorClass: "text-yellow-600 dark:text-yellow-400",
        bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
        emoji: "⏸️"
      };
    }

    // Before calibration, show neutral waiting state (avoid false red/orange spikes)
    if (!isCalibrated) {
      return {
        label: "Calibration...",
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted",
        emoji: "🎧"
      };
    }
    
    // If SPS is too low, consider user is not speaking (avoid false "Parfait")
    if (sps < MIN_SPEAKING_SPS) {
      return {
        label: "Parlez...",
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted",
        emoji: "🎤"
      };
    }
    
    const zone = getSPSZone(sps, targetSps);
    
    // Map zone to emoji
    let emoji = "🎤";
    if (zone.zone === 'perfect') emoji = "✅";
    else if (zone.zone === 'good') emoji = "👍";
    else if (zone.zone === 'too_slow') emoji = "🐢";
    else if (zone.zone === 'warning') emoji = "⚡";
    else if (zone.zone === 'danger') emoji = "🔴";
    
    return {
      label: zone.label,
      colorClass: zone.colorClass,
      bgClass: zone.bgClass,
      emoji
    };
  }, [sps, targetSps, isPaused]);

  // Debounce state updates to reduce flickering
  useEffect(() => {
    const now = Date.now();
    
    // If paused, update immediately
    if (isPaused) {
      setStableState(currentState);
      return;
    }
    
    // If same state, no need to debounce
    if (currentState.label === stableState.label) {
      return;
    }
    
    // Clear any pending timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // If enough time has passed since last change, update immediately
    if (now - lastChangeTime.current > FEEDBACK_DEBOUNCE_MS) {
      setStableState(currentState);
      lastChangeTime.current = now;
    } else {
      // Otherwise, debounce the update
      debounceTimer.current = setTimeout(() => {
        setStableState(currentState);
        lastChangeTime.current = Date.now();
      }, FEEDBACK_DEBOUNCE_MS);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentState, stableState.label, isPaused]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto flex-wrap sm:flex-nowrap">
          {/* Play/Pause Button */}
          {onTogglePause && (
            <Button
              variant="outline"
              size="lg"
              onClick={onTogglePause}
              disabled={disabled}
              className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl gap-2 font-medium text-sm sm:text-base"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  <span>Reprendre</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              )}
            </Button>
          )}

          {/* SPS Display - Stabilized with debounce */}
          <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl ${stableState.bgClass} min-w-0 sm:min-w-[180px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              {/* Recording indicator */}
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              
              {/* Status emoji + label - Smoothly animated */}
              <div className="flex items-center gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stableState.emoji}
                    initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="text-xl sm:text-2xl"
                  >
                    {stableState.emoji}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stableState.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className={`text-sm sm:text-base font-semibold ${stableState.colorClass} transition-colors duration-700`}
                  >
                    {stableState.label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Micro-hint for user */}
            {isRecording && !isPaused && (
              <p className="text-[10px] text-muted-foreground/70 text-center mt-1">
                {!isCalibrated
                  ? "Je vous écoute, continuez à parler 🎧"
                  : stableState.label === "Parlez..." 
                    ? "Continuez à parler..." 
                    : stableState.label === "Parfait"
                      ? "Rythme idéal 👍"
                      : stableState.label === "Bien"
                        ? "Bon contrôle 👍"
                        : stableState.label === "Trop vite !" || stableState.label === "Doucement..."
                          ? "Ralentissez un peu..."
                          : "Essayez de parler un peu plus vite"
                }
              </p>
            )}
          </div>

          {/* Filler Pill - Only show if detecting */}
          {fillerCount !== undefined && (
            <FillerPill count={fillerCount} isRecording={isRecording && !isPaused} />
          )}

          {/* Stop Button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onStop}
            disabled={disabled}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl gap-2 font-medium text-sm sm:text-base"
          >
            <Square className="w-5 h-5" />
            <span>Terminer</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BiofeedbackBar;
