import { motion } from "framer-motion";

const tips = [
  "Inspirez par le nez, expirez par la bouche 🌬️",
  "La régularité fait la différence 🌱",
  "Quelques minutes par jour, des nuits meilleures 🌙",
  "La respiration nasale, votre premier allié 👃",
  "Chaque exercice renforce votre musculature orofaciale 💪",
  "Un souffle maîtrisé, un sommeil réparé ✨",
];

const PageLoader = () => {
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      {/* Breathing animation */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring — slow expand/contract like a breath */}
        <motion.div
          className="absolute rounded-full bg-primary/10"
          animate={{ width: [64, 96, 64], height: [64, 96, 64], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner circle */}
        <motion.div
          className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="w-7 h-7 rounded-full bg-primary/60"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
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
