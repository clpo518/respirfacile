import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  onComplete: () => void;
}

const CountdownOverlay = ({ onComplete }: CountdownOverlayProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key="countdown-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
        >
          <div className="flex flex-col items-center gap-5">
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.3, filter: "blur(6px)" }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-6xl font-bold text-primary/80 font-display select-none"
              >
                {count}
              </motion.span>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Préparez-vous…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountdownOverlay;
