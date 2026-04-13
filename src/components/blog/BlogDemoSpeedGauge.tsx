import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const BlogDemoSpeedGauge = () => {
  return (
    <div className="my-10 rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/30">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Résultat du test vocal — Exemple</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          {/* Gauge */}
          <motion.div
            className="relative w-40 h-40 md:w-48 md:h-48"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className="stroke-orange-400"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * 0.3 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">5.8</span>
              <span className="text-sm text-muted-foreground">syll/s</span>
              <span className="text-lg mt-1">⚡</span>
            </div>
          </motion.div>

          {/* Result card */}
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-3">
              ⚡ Au-dessus de la norme
            </div>
            <p className="text-sm text-muted-foreground">
              Norme adulte : <strong className="text-foreground">3.5 – 5.0 syll/s</strong> (Van Zaalen, 2009)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDemoSpeedGauge;
