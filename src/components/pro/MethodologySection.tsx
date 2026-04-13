import { motion } from "framer-motion";
import { FlaskConical, AlertTriangle, CheckCircle2, Target, Timer, Clock, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const methodCards = [
  {
    icon: AlertTriangle,
    title: "Le Problème",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    description: "Les outils classiques divisent le nombre de mots par le temps total. Si le patient fait une pause respiratoire, son score s'effondre artificiellement."
  },
  {
    icon: CheckCircle2,
    title: "Notre Solution",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Nous calculons les Syllabes Par Seconde (SPS) en utilisant les timestamps précis de chaque mot. On exclut les silences et pauses."
  },
  {
    icon: Target,
    title: "Impact Clinique",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    description: "Le patient qui fait une pause de 2 secondes n'est pas pénalisé : on mesure son débit RÉEL d'articulation, pas le temps d'hésitation."
  }
];

const AnimatedComparison = () => {
  const [animating, setAnimating] = useState(false);
  const [wrongValue, setWrongValue] = useState(0);
  const [rightValue, setRightValue] = useState(0);

  useEffect(() => {
    // Start animation after component mount
    const timer = setTimeout(() => {
      setAnimating(true);
      // Animate wrong value (slow because includes silence)
      const wrongInterval = setInterval(() => {
        setWrongValue(prev => {
          if (prev >= 1.1) {
            clearInterval(wrongInterval);
            return 1.1;
          }
          return prev + 0.1;
        });
      }, 150);
      
      // Animate right value (fast because excludes silence)
      const rightInterval = setInterval(() => {
        setRightValue(prev => {
          if (prev >= 2.7) {
            clearInterval(rightInterval);
            return 2.7;
          }
          return prev + 0.3;
        });
      }, 100);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50">
      <div className="text-center mb-6">
        <p className="text-slate-300 mb-2">Patient prononce :</p>
        <p className="text-xl font-medium text-white">
          "Bonjour..." <span className="text-slate-500">[pause 2s]</span> "...Marie."
        </p>
        <p className="text-sm text-slate-400 mt-2">4 syllabes • Temps total : 3.5s • Temps de parole : 1.5s</p>
      </div>

      <div className="space-y-4">
        {/* Wrong method */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl">❌</span>
              <span className="text-slate-300 font-medium">Méthode classique</span>
            </div>
            <span className="font-mono font-bold text-red-400 text-xl">
              {wrongValue.toFixed(1)} SPS
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">4 syllabes ÷ 3.5s (temps total)</p>
          <Progress value={(wrongValue / 4) * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Right method */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-xl">✅</span>
              <span className="text-slate-300 font-medium">Notre méthode (Van Zaalen)</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-xl">
              {rightValue.toFixed(1)} SPS
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">4 syllabes ÷ 1.5s (temps de parole réel)</p>
          <Progress value={(rightValue / 4) * 100} className="h-2 bg-slate-700 [&>div]:bg-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export const MethodologySection = () => {
  return (
    <section className="py-24 bg-slate-900">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
            <FlaskConical className="w-4 h-4" />
            Notre Méthodologie Clinique
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Une mesure qui compte : le <span className="text-cyan-400">Taux d'Articulation</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Basé sur la définition de l'Articulatory Rate de <strong className="text-slate-300">Van Zaalen</strong>
          </p>
        </motion.div>

        {/* 3 Explanation Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {methodCards.map((card, index) => (
            <motion.div
              key={index}
              className={`${card.bgColor} ${card.borderColor} border rounded-2xl p-6`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Animated Comparison */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <AnimatedComparison />
        </motion.div>

        {/* Credibility Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300">
            <Timer className="w-4 h-4 text-cyan-400" />
            Mesure instantanée (temps réel)
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Comptage syllabique français optimisé
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Conforme à l'Articulatory Rate
          </span>
        </motion.div>
      </div>
    </section>
  );
};
