import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Activity, Timer, MessageCircleWarning, Type, ExternalLink, AudioWaveform } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    icon: Activity,
    title: "Score de séance",
    description: "Mesure la qualité respiratoire sur l'ensemble de l'exercice.",
    details: "Un score ≤ 4.5 pts indique une bonne régularité. Entre 4.5 et 6 pts : à améliorer. Au-delà de 6 pts : rythme irrégulier à travailler avec l'orthophoniste.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    icon: Timer,
    title: "Taux de complétion",
    description: "Pourcentage de la séance réalisée en continuité.",
    details: "> 80% = Excellent | 60-80% = Correct | < 60% = Interrompue — à surveiller",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  },
  {
    icon: MessageCircleWarning,
    title: "Mots d'appui",
    description: "\"euh\", \"du coup\", \"en fait\" détectés automatiquement.",
    details: "Indicateur de relâchement attentionnel pendant les exercices de lecture ou de parole guidée",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Type,
    title: "Cycles respiratoires",
    description: "Nombre de cycles complétés pendant la séance.",
    details: "Chaque cycle correspond à une inspiration + expiration complètes selon le rythme prescrit",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Activity,
    title: "Score maximal",
    description: "Score le plus élevé atteint pendant la séance.",
    details: "Un écart important entre le score moyen et le score max révèle des épisodes d'irrégularité à cibler en consultation.",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    icon: AudioWaveform,
    title: "Analyse myofonctionnelle",
    description: "Détection des patterns respiratoires buccaux et nasaux.",
    details: "Évalue la prévalence de la respiration nasale vs buccale au fil des séances",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    isBeta: true,
    betaNote: "Première version — en cours d'amélioration"
  }
];

export const MetricsInfoCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border-cyan-500/20">
      <CardHeader 
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Comprendre les métriques</CardTitle>
              <p className="text-sm text-muted-foreground">
                Score, complétion, cycles — Tout ce qu'il faut savoir
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {metrics.map((metric, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl bg-background border ${metric.isBeta ? 'border-purple-300 bg-purple-50/30 dark:bg-purple-950/20' : 'border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{metric.title}</h4>
                          {metric.isBeta && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                              Bêta
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
                        <p className="text-xs font-medium text-foreground/80">{metric.details}</p>
                        {metric.betaNote && (
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1.5 italic">
                            ✨ {metric.betaNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
