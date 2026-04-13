import { motion } from "framer-motion";

const tips = [
  "Respirez… puis parlez 🌬️",
  "Chaque syllabe compte 🎯",
  "Doucement mais sûrement 🐢",
  "Prenez votre temps ⏳",
  "La fluidité vient avec la pratique ✨",
  "Inspirez… expirez… parlez 🧘",
];

const PageLoader = () => {
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      {/* Animated speech bubble */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          {/* Bubble */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {/* Animated dots inside bubble */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary/60"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/10 rounded-full scale-75" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-[40%] w-2.5 h-2.5 bg-primary/10 rounded-full scale-50" />
        </motion.div>
      </div>

      {/* Tip text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-muted-foreground font-medium tracking-wide"
      >
        {tip}
      </motion.p>
    </div>
  );
};

export default PageLoader;
