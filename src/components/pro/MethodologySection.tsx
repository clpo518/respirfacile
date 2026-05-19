import { motion } from "framer-motion";
import { FlaskConical, AlertTriangle, CheckCircle2, Target, Timer, Clock, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const methodCards = [
  {
    icon: AlertTriangle,
    title: "Le Défi",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    description: "Entre les séances, les patients s'exercent seuls sans feedback objectif. Il est impossible de savoir s'ils appliquent correctement les consignes respiratoires."
  },
  {
    icon: CheckCircle2,
    title: "Notre Approche",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "Chaque exercice est enregistré et analysé : régularité des cycles, durée, observance. Un score de séance synthétise la qualité de la pratique."
  },
  {
    icon: Target,
    title: "Bénéfice Clinique",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    description: "L'orthophoniste dispose de données objectives à chaque consultation — courbe de progression, taux d'observance, évolution semaine par semaine."
  }
];

const AnimatedComparison = () => {
  const [progressA, setProgressA] = useState(0);
  const [progressB, setProgressB] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const intervalA = setInterval(() => {
        setProgressA(prev => {
          if (prev >= 40) { clearInterval(intervalA); return 40; }
          return prev + 2;
        });
      }, 80);
      const intervalB = setInterval(() => {
        setProgressB(prev => {
          if (prev >= 85) { clearInterval(intervalB); return 85; }
          return prev + 3;
        });
      }, 60);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50">
      <div className="text-center mb-6">
        <p className="text-slate-300 mb-2">Même patient, deux semaines d'écart :</p>
        <p className="text-xl font-medium text-white">
          6 séances complétées — durée moyenne 8 min
        </p>
        <p className="text-sm text-slate-400 mt-2">Exercice prescrit : cohérence cardiaque • Cible : 6 cycles/min</p>
      </div>

      <div className="space-y-4">
        {/* Before */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl">📅</span>
              <span className="text-slate-300 font-medium">Semaine 1</span>
            </div>
            <span className="font-mono font-bold text-red-400 text-xl">
              {progressA}% dans la cible
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">Rythme irrégulier — 3 séances sur 6 à 6 cpm</p>
          <Progress value={progressA} className="h-2 bg-slate-700" />
        </div>

        {/* After */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-xl">📅</span>
              <span className="text-slate-300 font-medium">Semaine 2</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-xl">
              {progressB}% dans la cible
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-2">Progression nette — 5 séances sur 6 à 6 cpm</p>
          <Progress value={progressB} className="h-2 bg-slate-700 [&>div]:bg-emerald-500" />
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
            Un suivi qui compte : <span className="text-cyan-400">l'observance à domicile</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Des données objectives pour chaque séance — sans effort supplémentaire pour l'orthophoniste
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
            6 catégories d'exercices respiratoires
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Conforme aux recommandations IALP
          </span>
        </motion.div>
      </div>
    </section>
  );
};
