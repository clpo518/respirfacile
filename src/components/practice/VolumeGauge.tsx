import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { VolumeZone } from "@/hooks/useVolumeBiofeedback";

interface VolumeGaugeProps {
  volumePercent: number;
  zone: VolumeZone;
  isCalibrated: boolean;
  calibrationProgress: number;
  volumeLevel: number; // raw 0-1
}

const ZONE_CONFIG: Record<VolumeZone, { label: string; emoji: string; color: string; bg: string }> = {
  calibrating: { label: "Calibration...", emoji: "🎤", color: "hsl(var(--muted-foreground))", bg: "bg-muted" },
  too_low: { label: "Trop faible", emoji: "🔇", color: "hsl(var(--speed-critical))", bg: "bg-speed-critical/20" },
  target: { label: "Bon volume", emoji: "✅", color: "hsl(var(--speed-calm))", bg: "bg-speed-calm/20" },
  strong: { label: "Forte projection !", emoji: "📢", color: "hsl(var(--primary))", bg: "bg-primary/20" },
  too_loud: { label: "Trop fort", emoji: "⚠️", color: "hsl(var(--speed-fast))", bg: "bg-speed-fast/20" },
};

const VolumeGauge = ({ volumePercent, zone, isCalibrated, calibrationProgress, volumeLevel }: VolumeGaugeProps) => {
  const config = ZONE_CONFIG[zone];

  // Smoothed volume for display (EMA filter)
  const smoothedRef = useRef(0);
  const barHeight = useMemo(() => {
    const raw = !isCalibrated ? volumeLevel * 100 : Math.min(100, volumePercent);
    // Exponential moving average: α=0.15 for smooth, α=0.3 for responsive
    const alpha = 0.18;
    smoothedRef.current = smoothedRef.current * (1 - alpha) + raw * alpha;
    return smoothedRef.current;
  }, [isCalibrated, volumeLevel, volumePercent]);

  // SVG arc gauge
  const arcData = useMemo(() => {
    const angle = Math.min(180, (barHeight / 180) * 180);
    const rotation = angle - 90;
    return { rotation };
  }, [barHeight]);

  if (!isCalibrated) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Calibration UI */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${calibrationProgress * 264} 264`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-200"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🎤
            </motion.span>
            <span className="text-xs text-muted-foreground mt-1">{Math.round(calibrationProgress * 100)}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Calibration du volume</p>
          <p className="text-sm text-muted-foreground mt-1">
            Parlez normalement pendant 5 secondes...
          </p>
        </div>
        {/* Live volume bar during calibration */}
        <div className="w-4 h-24 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="absolute bottom-0 w-full rounded-full bg-primary/60"
            animate={{ height: `${volumeLevel * 100}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main VU-meter */}
      <div className="flex items-end gap-2">
        {/* Vertical bar gauge */}
        <div className="relative w-10 h-48 bg-muted/50 rounded-xl overflow-hidden border border-border/50">
          {/* Zone indicators */}
          <div className="absolute inset-x-0 top-0 h-[10%] bg-speed-fast/10 border-b border-speed-fast/20" />
          <div className="absolute inset-x-0 top-[10%] h-[20%] bg-primary/5" />
          <div className="absolute inset-x-0 top-[30%] h-[30%] bg-speed-calm/10" />
          <div className="absolute inset-x-0 top-[60%] h-[40%] bg-speed-critical/5" />

          {/* Baseline marker */}
          <div
            className="absolute inset-x-0 h-0.5 bg-foreground/40 z-10"
            style={{ bottom: `${(100 / 180) * 100}%` }}
          >
            <span className="absolute -right-6 -top-2 text-[9px] text-muted-foreground">ref</span>
          </div>

          {/* Active volume bar */}
          <motion.div
            className="absolute bottom-0 inset-x-0 rounded-t-lg"
            style={{ backgroundColor: config.color }}
            animate={{ height: `${Math.min(100, barHeight / 1.8)}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>

        {/* Emoji + percent */}
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          <motion.span
            className="text-4xl"
            key={zone}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {config.emoji}
          </motion.span>
          <motion.span
            className="text-2xl font-bold tabular-nums"
            style={{ color: config.color }}
            key={Math.round(volumePercent)}
          >
            {Math.round(volumePercent)}%
          </motion.span>
          <span className="text-xs text-muted-foreground">du volume ref.</span>
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        className={`px-4 py-1.5 rounded-full text-sm font-medium ${config.bg}`}
        style={{ color: config.color }}
        key={zone}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {config.label}
      </motion.div>

      {/* Micro-hint */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        {zone === "too_low" && "Projetez votre voix ! Imaginez quelqu'un au fond de la pièce."}
        {zone === "target" && "Volume bien maintenu, continuez 👍"}
        {zone === "strong" && "Excellente projection ! C'est l'objectif 🎯"}
        {zone === "too_loud" && "Un peu trop fort, modulez légèrement."}
      </p>
    </div>
  );
};

export default VolumeGauge;
