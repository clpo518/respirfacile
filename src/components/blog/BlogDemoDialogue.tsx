import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

const BlogDemoDialogue = () => {
  return (
    <div className="my-10 rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/30">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Mode Dialogue — Aperçu</span>
        <span className="ml-auto text-xs text-muted-foreground">2 interlocuteurs</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center gap-8 md:gap-12 mb-6">
          {/* Person 1 - Good speed */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 flex flex-col items-center justify-center relative">
              <motion.div
                className="absolute inset-0 rounded-full border-[5px] border-emerald-400/30"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-3xl md:text-4xl">✅</span>
              <span className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">3.8 syll/s</span>
            </div>
            <span className="text-sm text-muted-foreground mt-3 font-medium">Vous</span>
          </motion.div>

          {/* Person 2 - Too fast */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] border-orange-400 bg-orange-50 dark:bg-orange-900/20 flex flex-col items-center justify-center relative">
              <motion.div
                className="absolute inset-0 rounded-full border-[5px] border-orange-300/30"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-3xl md:text-4xl">⚡</span>
              <span className="text-sm md:text-base font-bold text-orange-500 dark:text-orange-400 mt-1">5.2 syll/s</span>
            </div>
            <span className="text-sm text-muted-foreground mt-3 font-medium">Interlocuteur</span>
          </motion.div>
        </div>

        <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
          Chaque personne reçoit <strong className="text-foreground">sa propre jauge</strong> — comparez vos débits en temps réel.
        </p>
      </div>
    </div>
  );
};

export default BlogDemoDialogue;
