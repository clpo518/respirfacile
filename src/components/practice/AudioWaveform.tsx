import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  data: number[];
  isActive: boolean;
}

const AudioWaveform = ({ data, isActive }: AudioWaveformProps) => {
  return (
    <div className="h-24 bg-secondary/50 rounded-xl flex items-center justify-center gap-0.5 px-4 overflow-hidden">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={{
            height: isActive ? `${value}%` : "20%",
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
          style={{ minHeight: 4, maxHeight: 80 }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
