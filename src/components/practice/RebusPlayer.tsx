import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Turtle, Rabbit } from "lucide-react";
import type { RebusSegment } from "@/data/exercises";

interface RebusPlayerProps {
  segments: RebusSegment[];
  title: string;
  highlightedIndex?: number | null;
  isRecording?: boolean;
  /** Countdown before restart (3, 2, 1, null) */
  countdown?: number | null;
}

const PAUSE_DURATION_MS = 600;

const RebusPlayer = ({ segments, title, highlightedIndex = null, isRecording = false, countdown = null }: RebusPlayerProps) => {
  const [rate, setRate] = useState(0.6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const synthRef = useRef(window.speechSynthesis);
  const cancelledRef = useRef(false);

  // Use external highlight if provided, otherwise use internal TTS highlight
  const displayIndex = highlightedIndex !== null ? highlightedIndex : activeIndex;

  const speakSegment = useCallback(
    (text: string, idx: number): Promise<void> =>
      new Promise((resolve, reject) => {
        if (cancelledRef.current) return reject("cancelled");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        utterance.rate = rate;
        utterance.onstart = () => setActiveIndex(idx);
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          if (e.error === "canceled") reject("cancelled");
          else resolve();
        };
        synthRef.current.speak(utterance);
      }),
    [rate]
  );

  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (cancelledRef.current) return reject("cancelled");
      setTimeout(() => {
        if (cancelledRef.current) reject("cancelled");
        else resolve();
      }, ms);
    });

  const playAll = async () => {
    synthRef.current.cancel();
    cancelledRef.current = false;
    setIsPlaying(true);
    try {
      for (let i = 0; i < segments.length; i++) {
        await speakSegment(segments[i].segment, i);
        if (segments[i].pause_after && i < segments.length - 1) {
          setActiveIndex(null);
          await wait(PAUSE_DURATION_MS);
        }
      }
    } catch {
      // cancelled
    }
    setActiveIndex(null);
    setIsPlaying(false);
  };

  const stopPlayback = () => {
    cancelledRef.current = true;
    synthRef.current.cancel();
    setIsPlaying(false);
    setActiveIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Rebus grid */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4">
        {segments.map((seg, idx) => (
          <div key={idx} className="contents">
            {/* Emoji card */}
            <motion.div
              animate={displayIndex === idx ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-colors min-w-[100px] ${
                displayIndex === idx
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-6xl md:text-7xl leading-none select-none">{seg.emoji}</span>
              <span className="mt-2 text-base md:text-lg font-medium text-foreground/80 text-center max-w-[120px] leading-tight">
                {seg.segment}
              </span>
            </motion.div>

            {/* Breath bars */}
            {seg.pause_after && idx < segments.length - 1 && (
              <div className="flex items-center gap-[3px] px-2 self-center" title="Pause — Respire !">
                {[0, 1, 2].map((bar) => (
                  <motion.div
                    key={bar}
                    className="w-1.5 rounded-full bg-orange-400"
                    animate={
                      (displayIndex === null && isPlaying) || (isRecording && displayIndex === null)
                        ? { height: [24, 36, 24], opacity: [0.6, 1, 0.6] }
                        : { height: 28, opacity: 0.8 }
                    }
                    transition={{ duration: 0.8, repeat: Infinity, delay: bar * 0.15 }}
                    style={{ height: 28 }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Countdown overlay before restart */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <span className="text-lg text-muted-foreground">🌬️ Reprends ton souffle…</span>
            <motion.span
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-primary"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {!isRecording && (
        <div className="flex flex-col items-center gap-4">
          {/* Speed toggle */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/60 border border-border">
            <Turtle className="w-5 h-5 text-emerald-600" />
            <Slider
              min={0.4}
              max={1.0}
              step={0.1}
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
              className="w-32"
              disabled={isPlaying}
            />
            <Rabbit className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-center">
              {rate.toFixed(1)}×
            </span>
          </div>

          {/* Play / Stop */}
          <Button
            size="lg"
            variant={isPlaying ? "destructive" : "default"}
            onClick={isPlaying ? stopPlayback : playAll}
            className="gap-2 rounded-full h-14 px-8 text-base"
          >
            <Volume2 className="w-5 h-5" />
            {isPlaying ? "Arrêter" : "Écouter 👂"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RebusPlayer;
