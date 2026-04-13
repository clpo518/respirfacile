import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const words = [
  { text: "Le", syllables: 1 },
  { text: "soleil", syllables: 2 },
  { text: "brille", syllables: 1 },
  { text: "sur", syllables: 1 },
  { text: "la", syllables: 1 },
  { text: "montagne", syllables: 2 },
  { text: "enneigée.", syllables: 3 },
];

const BlogDemoKaraoke = () => {
  const [activeWord, setActiveWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % words.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-10 rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/30">
        <Play className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Lecture guidée — Aperçu</span>
        <span className="ml-auto text-xs text-muted-foreground">3.5 syll/s</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
          {words.map((word, index) => (
            <motion.span
              key={index}
              className={`text-xl md:text-2xl font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
                index < activeWord
                  ? "text-muted-foreground/40"
                  : index === activeWord
                  ? "text-primary bg-primary/10 scale-110"
                  : "text-foreground"
              }`}
              animate={index === activeWord ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>

        {/* Speed bar */}
        <div className="max-w-xs mx-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-muted-foreground">Débit actuel</span>
            <span className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400">3.5 syll/s ✅</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              animate={{ width: ["55%", "62%", "55%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>🐢 Lent</span>
            <span>✅ Cible</span>
            <span>⚡ Rapide</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5 max-w-md mx-auto">
          Le surligneur avance mot par mot au rythme cible. Vous suivez visuellement, votre bouche ralentit naturellement.
        </p>
      </div>
    </div>
  );
};

export default BlogDemoKaraoke;
