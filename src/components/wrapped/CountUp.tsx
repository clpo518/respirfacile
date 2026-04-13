import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function CountUp({ end, duration = 1.5, decimals = 0, suffix = "", prefix = "", className = "" }: CountUpProps) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(prefix + "0" + suffix);

  useEffect(() => {
    const controls = animate(count, end, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        setDisplay(prefix + v.toFixed(decimals) + suffix);
      },
    });
    return controls.stop;
  }, [end, duration, decimals, suffix, prefix]);

  return <span className={className}>{display}</span>;
}
