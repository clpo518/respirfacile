import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const emojis = ["🐮", "🍽️", "🍦"];

const BlogDemoRebus = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % (emojis.length * 2)); // *2 for breath bars
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const currentEmoji = Math.floor(activeIdx / 2);
  const isBreathPause = activeIdx % 2 === 1;

  return (
    <div className="my-10 rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/30">
        <span className="text-base">🧒</span>
        <span className="text-sm font-medium text-foreground">Mode Rébus — Aperçu</span>
        <span className="ml-auto text-xs text-muted-foreground">Enfant non-lecteur</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center gap-3 md:gap-5 mb-6">
          {emojis.map((emoji, index) => (
            <div key={index} className="flex items-center gap-3 md:gap-5">
              <motion.div
                className={`text-5xl md:text-6xl transition-all duration-300 ${
                  index < currentEmoji
                    ? "opacity-30 scale-90"
                    : index === currentEmoji
                    ? "opacity-100 scale-110"
                    : "opacity-50"
                }`}
                animate={
                  index === currentEmoji && !isBreathPause
                    ? { scale: [1.1, 1.2, 1.1] }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                {emoji}
              </motion.div>
              {index < emojis.length - 1 && (
                <motion.div
                  className="flex gap-1"
                  animate={
                    index === currentEmoji && isBreathPause
                      ? { opacity: [0.4, 1, 0.4] }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {[0, 1, 2].map((b) => (
                    <div
                      key={b}
                      className={`w-1.5 h-8 md:h-10 rounded-full ${
                        index === currentEmoji && isBreathPause
                          ? "bg-orange-400"
                          : "bg-orange-300/40"
                      }`}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground max-w-sm mx-auto">
          L'enfant nomme chaque image. Les <strong className="text-orange-500">barres de souffle</strong> marquent les pauses respiratoires — pas besoin de savoir lire.
        </p>
      </div>
    </div>
  );
};

export default BlogDemoRebus;
