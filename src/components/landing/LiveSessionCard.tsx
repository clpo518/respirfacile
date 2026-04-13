import { motion } from "framer-motion";
import { Stethoscope, CheckCircle2, Timer, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const LiveSessionCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />Nouveau
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Timer className="w-4 h-4" />Mode En séance
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Débitmètre{" "}
              <span className="text-primary italic">en direct</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-2">
              Mesurez le débit de parole de votre patient en temps réel, directement pendant la consultation.
            </p>
            <p className="text-lg text-foreground font-semibold mb-6">
              Un chronomètre, une jauge, zéro distraction.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Interface plein écran, sans distraction",
                "Mesure SPS en temps réel (méthode Van Zaalen)",
                "Une jauge par interlocuteur — patient vs thérapeute",
                "Bilan instantané : moyenne, min, max",
                "Sauvegardé sur le profil du patient",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Visual mock */}
          <div className="relative">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
                Aperçu du débitmètre
              </p>

              {/* Circular gauge mock */}
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  <circle
                    cx="80" cy="80" r="68"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="80" cy="80" r="68"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 68}
                    initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 68 * 0.38 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                  >
                    4.2
                  </motion.span>
                  <span className="text-xs text-muted-foreground">syll/s</span>
                </div>
              </div>

              {/* Timer + status */}
              <div className="flex items-center justify-between text-sm px-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Séance : <strong className="text-foreground">2 min 34</strong></span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  ✅ Normo-fluent
                </span>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                {[
                  { label: "Moy.", value: "4.2" },
                  { label: "Min", value: "3.1" },
                  { label: "Max", value: "5.4" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default LiveSessionCard;
