import { motion } from "framer-motion";
import { useMemo } from "react";

interface SpeedGaugeProps {
  wpm: number;
  maxWpm?: number;
  targetWpm?: number;
}

const SpeedGauge = ({ wpm, maxWpm = 250 }: SpeedGaugeProps) => {
  const { rotation, color, label, bgColor } = useMemo(() => {
    // Map WPM to rotation angle (-90 to 90 degrees)
    const clampedWpm = Math.min(wpm, maxWpm);
    const rotation = (clampedWpm / maxWpm) * 180 - 90;
    
    let color: string;
    let label: string;
    let bgColor: string;
    
    if (wpm === 0) {
      color = "hsl(var(--muted-foreground))";
      label = "En attente...";
      bgColor = "bg-muted";
    } else if (wpm < 150) {
      color = "hsl(var(--speed-calm))";
      label = "Rythme parfait";
      bgColor = "bg-speed-calm/20";
    } else if (wpm < 190) {
      color = "hsl(var(--speed-fast))";
      label = "Un peu rapide";
      bgColor = "bg-speed-fast/20";
    } else {
      color = "hsl(var(--speed-critical))";
      label = "Ralentissez !";
      bgColor = "bg-speed-critical/20";
    }
    
    return { rotation, color, label, bgColor };
  }, [wpm, maxWpm]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-32 overflow-hidden">
        {/* Gauge background */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Colored zones */}
          {/* Green zone: 0-150 WPM (0-60%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 68 32"
            fill="none"
            stroke="hsl(var(--speed-calm))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Orange zone: 150-190 WPM (60-76%) */}
          <path
            d="M 68 32 A 80 80 0 0 1 120 22"
            fill="none"
            stroke="hsl(var(--speed-fast))"
            strokeWidth="12"
            strokeLinecap="butt"
            opacity="0.3"
          />
          
          {/* Red zone: 190-250 WPM (76-100%) */}
          <path
            d="M 120 22 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--speed-critical))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Needle */}
          <motion.g
            style={{ transformOrigin: "100px 100px" }}
            animate={{ rotate: rotation }}
            transition={{ type: "tween", duration: 0.1, ease: "linear" }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="25"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={color} />
          </motion.g>
          
          {/* Labels */}
          <text x="20" y="98" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">0</text>
          <text x="100" y="15" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">150</text>
          <text x="180" y="98" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">250</text>
        </svg>
      </div>
      
      {/* WPM Display */}
      <div className="text-center -mt-4">
        <motion.p
          className="text-5xl font-bold"
          style={{ color }}
          key={wpm}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {wpm}
        </motion.p>
        <p className="text-muted-foreground text-sm">mots / minute</p>
      </div>
      
      {/* Status badge */}
      <motion.div
        className={`mt-4 px-4 py-2 rounded-full font-medium ${bgColor}`}
        style={{ color }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={label}
      >
        {label}
      </motion.div>
    </div>
  );
};

export default SpeedGauge;
