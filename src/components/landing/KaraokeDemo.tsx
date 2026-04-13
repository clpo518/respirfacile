import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_TEXT = "Le bredouillement se caractérise par un débit excessif et une articulation parfois imprécise.";
const WORDS = DEMO_TEXT.split(" ");
const SPEED_MS = 460; // ~4.0 SPS (rythme modéré conseillé)

export const KaraokeDemo = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1); // -1 = paused/not started
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    setIsPlaying(true);
    setIsFinished(false);
    setCurrentWordIndex(0);

    intervalRef.current = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= WORDS.length - 1) {
          stopAnimation();
          setIsPlaying(false);
          setIsFinished(true);
          return prev;
        }
        return prev + 1;
      });
    }, SPEED_MS);
  }, [stopAnimation]);

  const handlePlay = () => {
    if (isFinished) {
      // Restart
      setCurrentWordIndex(-1);
      setTimeout(() => startAnimation(), 100);
    } else {
      startAnimation();
    }
  };

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  // Check if word has punctuation for pause indicator
  const hasPunctuation = (word: string) => /[.,;:!?]$/.test(word);

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto border border-border/50 relative">
      {/* Karaoke Text */}
      <div className="text-lg md:text-xl leading-relaxed font-serif min-h-[80px] flex flex-wrap items-center justify-center gap-x-2 gap-y-1 relative py-4">
        {WORDS.map((word, index) => {
          const isPast = currentWordIndex >= 0 && index < currentWordIndex;
          const isCurrent = index === currentWordIndex;

          return (
            <motion.span
              key={index}
              className={`
                transition-all duration-200 rounded px-1 origin-center
                ${isCurrent 
                  ? "bg-primary text-primary-foreground font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                  : isPast 
                    ? "text-foreground/60" 
                    : "text-foreground/80"
                }
              `}
              animate={isCurrent ? { 
                boxShadow: [
                  "0 0 0 rgba(16, 185, 129, 0)",
                  "0 0 10px rgba(16, 185, 129, 0.5)",
                  "0 0 0 rgba(16, 185, 129, 0)"
                ]
              } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {word}
            </motion.span>
          );
        })}

        {/* Play Overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl"
            >
              <Button
                onClick={handlePlay}
                size="lg"
                className="gap-2 px-6 py-5 text-base shadow-lg hover:scale-105 transition-transform"
              >
                {isFinished ? (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    Rejouer
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Lancer la démo
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar - only show when playing */}
      {isPlaying && (
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${((currentWordIndex + 1) / WORDS.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};