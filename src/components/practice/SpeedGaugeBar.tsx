import { motion } from "framer-motion";
import { useMemo } from "react";
import { getAdaptiveThresholds } from "@/lib/spsUtils";

interface SpeedGaugeBarProps {
  sps: number;
  targetSps: number;
  showLabel?: boolean;
  compact?: boolean;
}

/**
 * Visual gauge bar for speech speed display
 * Uses color gradient (green → yellow → red) instead of raw numbers
 * Pedagogical: shows "syllabes" term but focuses on visual feedback
 */
const SpeedGaugeBar = ({ 
  sps, 
  targetSps, 
  showLabel = true,
  compact = false 
}: SpeedGaugeBarProps) => {
  const { percentage, color, bgColor, label, emoji, message } = useMemo(() => {
    // Gauge is RELATIVE to target: 100% = target reached
    const percentage = targetSps > 0 ? Math.min((sps / targetSps) * 100, 150) : 0;
    // Clamp display to 100% width
    const displayPercentage = Math.min(percentage, 100);
    
    // Use same adaptive thresholds as SessionResultModal for consistency
    const diff = sps - targetSps;
    const { good, bad } = getAdaptiveThresholds(targetSps);
    
    let color: string;
    let bgColor: string;
    let label: string;
    let emoji: string;
    let message = "";
    
    if (sps === 0) {
      color = "hsl(var(--muted-foreground))";
      bgColor = "bg-muted";
      label = "En attente";
      emoji = "⏳";
    } else if (diff < -bad) {
      color = "hsl(210 80% 60%)"; // Blue
      bgColor = "bg-blue-500";
      label = "Très posé";
      emoji = "🐢";
      message = "Vous ralentissez bien, c'est le but !";
    } else if (diff < -good) {
      color = "hsl(142 76% 45%)"; // Green
      bgColor = "bg-green-500";
      label = "Bien contrôlé";
      emoji = "👍";
      message = "Bon contrôle du débit, continuez !";
    } else if (diff <= good) {
      color = "hsl(142 76% 45%)"; // Green
      bgColor = "bg-emerald-500";
      label = "Objectif atteint";
      emoji = "✅";
      message = "Pile dans l'objectif, bravo !";
    } else if (diff <= bad) {
      color = "hsl(38 92% 50%)"; // Orange
      bgColor = "bg-orange-500";
      label = "Un peu au-dessus";
      emoji = "⚡";
      message = "Légèrement au-dessus de l'objectif";
    } else {
      color = "hsl(0 84% 60%)"; // Red
      bgColor = "bg-red-500";
      label = "Trop vite";
      emoji = "🔴";
      message = "Essayez de ralentir";
    }
    
    return { percentage: displayPercentage, color, bgColor, label, emoji, message };
  }, [sps, targetSps]);

  // Target zone is relative: green zone = 50%-100% of target
  const targetZone = useMemo(() => {
    return {
      left: 50, // 50% of target = 50% of bar
      width: 50, // from 50% to 100% of bar = the green zone
    };
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Label row */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-medium" style={{ color }}>{label}</span>
          </div>
          <span className="text-muted-foreground text-xs">
            {sps.toFixed(1)} syll/s
          </span>
        </div>
      )}
      
      {/* Gauge bar - relative to target */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Target zone indicator (green zone: 50%-100%) */}
        <div 
          className="absolute h-full bg-emerald-200/50 dark:bg-emerald-900/30"
          style={{ 
            left: `${targetZone.left}%`, 
            width: `${targetZone.width}%` 
          }}
        />
        
        {/* Current value bar */}
        <motion.div
          className={`absolute h-full rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Target marker at 100% */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: '100%' }}
        />
      </div>
      
      {/* Scale labels - relative to target */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>0</span>
        <span>{(targetSps / 2).toFixed(1)}</span>
        <span>{targetSps.toFixed(1)} syll/s (objectif)</span>
      </div>
      
      {/* Explicit success message for below-target */}
      {message && sps > 0 && (
        <p className="text-xs text-center mt-1" style={{ color }}>{message}</p>
      )}
    </div>
  );
};

export default SpeedGaugeBar;
