import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Stethoscope, Users, Mic, BarChart3 } from "lucide-react";

/** Animated SPS counter widget */
const SPSWidget = () => {
  const [sps, setSps] = useState(4.2);
  const [emoji, setEmoji] = useState("✅");

  useEffect(() => {
    const values = [
      { sps: 4.2, emoji: "✅" },
      { sps: 4.5, emoji: "✅" },
      { sps: 5.1, emoji: "⚡" },
      { sps: 4.8, emoji: "✅" },
      { sps: 3.8, emoji: "✅" },
      { sps: 5.6, emoji: "⚡" },
      { sps: 4.0, emoji: "✅" },
      { sps: 3.5, emoji: "🐢" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % values.length;
      setSps(values[i].sps);
      setEmoji(values[i].emoji);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm">
      <motion.span className="text-2xl" key={emoji} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
        {emoji}
      </motion.span>
      <div className="flex items-baseline gap-1.5">
        <motion.span
          className="text-2xl font-bold tabular-nums text-foreground"
          key={sps}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {sps.toFixed(1)}
        </motion.span>
        <span className="text-xs text-muted-foreground">syll/s</span>
      </div>
      <div className="h-6 w-px bg-border" />
      <span className="text-xs text-muted-foreground">Débit en temps réel</span>
    </div>
  );
};

const stats = [
  { icon: Users, value: "120+", label: "utilisateurs actifs" },
  { icon: Stethoscope, value: "85", label: "orthophonistes inscrits" },
  { icon: Mic, value: "1 800+", label: "séances réalisées" },
  { icon: BarChart3, value: "12", label: "modes d'exercice" },
];

export const UnifiedHeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-accent/30"
          animate={{ scale: [1.1, 1, 1.1], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <span className="badge-clinical inline-flex">
              <Activity className="w-3.5 h-3.5" />
              Bredouillement · Tachylalie · Bégaiement
            </span>
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Vous parlez trop vite ?{" "}
            <span className="gradient-text">Reprenez le contrôle.</span>
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            L'application de référence pour les troubles de la fluence. 
            Entraînez-vous seul ou avec votre orthophoniste, avec un biofeedback visuel en temps réel.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
              <Link to="/diagnostic">
                Tester ma vitesse gratuitement
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
              <a href="#orthophonistes">
                <Stethoscope className="w-4 h-4 mr-2" />
                Espace Orthophoniste
              </a>
            </Button>
          </motion.div>

          {/* SPS Widget */}
          <motion.div
            className="flex justify-center mt-8 mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <SPSWidget />
          </motion.div>
          <motion.p
            className="text-center text-xs text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Mesurez votre débit en syllabes par seconde — l'indicateur clinique de référence.
          </motion.p>
        </div>

        {/* Social proof stats bar */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-card/60 border border-border/40">
                <stat.icon className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
