/**
 * Floating stopwatch for timed battery tasks (OMAS, reading, writing 3min/5min)
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  className?: string;
}

const PRESETS = [
  { label: "3 min", seconds: 180, hint: "Épreuve d'écriture sous contrainte" },
  { label: "5 min", seconds: 300, hint: "Parole spontanée / enregistrement" },
  { label: "Libre", seconds: 0, hint: "Chronomètre sans limite" },
];

const BatteryStopwatch: React.FC<Props> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0); // 0 = stopwatch mode
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    startRef.current = Date.now() - elapsedRef.current * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      const now = Math.floor((Date.now() - startRef.current) / 1000);
      elapsedRef.current = now;
      setElapsed(now);
    }, 200);
  }, []);

  const reset = useCallback(() => {
    stop();
    elapsedRef.current = 0;
    setElapsed(0);
  }, [stop]);

  const selectPreset = (seconds: number) => {
    reset();
    setCountdown(seconds);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Auto-stop on countdown finish
  useEffect(() => {
    if (countdown > 0 && elapsed >= countdown && isRunning) {
      stop();
    }
  }, [elapsed, countdown, isRunning, stop]);

  const displayTime = countdown > 0 ? Math.max(0, countdown - elapsed) : elapsed;
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const isExpired = countdown > 0 && elapsed >= countdown;

  if (!isOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors ${className || ''}`}
          >
            <Timer className="w-4 h-4" />
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Chronomètre</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-background border-2 rounded-2xl shadow-xl p-4 w-72 ${isExpired ? 'border-destructive' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" />
          Chronomètre
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Réduire le chronomètre</TooltipContent>
        </Tooltip>
      </div>

      {/* Hint text */}
      <p className="text-[11px] text-muted-foreground text-center mb-2">
        Choisissez un mode puis cliquez sur « Démarrer » pour chronométrer l'épreuve.
      </p>

      {/* Display */}
      <div className={`text-center text-4xl font-mono font-bold tabular-nums mb-3 ${isExpired ? 'text-destructive animate-pulse' : ''}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      {isExpired && (
        <div className="text-center text-xs text-destructive font-medium mb-2">
          ⏰ Temps écoulé !
        </div>
      )}

      {/* Presets */}
      <div className="flex gap-1.5 mb-3">
        {PRESETS.map(p => (
          <Tooltip key={p.label}>
            <TooltipTrigger asChild>
              <button
                onClick={() => selectPreset(p.seconds)}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                  countdown === p.seconds ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-border'
                }`}
              >
                {p.label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{p.hint}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isRunning ? "outline" : "default"}
              className="flex-1 gap-1.5"
              onClick={isRunning ? stop : start}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause' : 'Démarrer'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRunning ? 'Mettre en pause le chronomètre' : 'Lancer le chronomètre pour chronométrer l\'épreuve'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remettre à zéro</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default BatteryStopwatch;
