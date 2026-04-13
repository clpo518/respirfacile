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
    title: "SPS (Syllabes/Seconde)",
    description: "Mesure le débit d'articulation par paquets de 5 syllabes (hors pauses et silences).",
    details: "Le calcul attend 5 syllabes prononcées, puis divise par le temps de parole réel du paquet (silences exclus). Ce mode par paquets donne un retour stable et cliniquement fiable, sans être perturbé par les pauses naturelles.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    icon: Timer,
    title: "Ratio de Fluence",
    description: "Temps de parole / Temps total de session.",
    details: "> 80% = Parole continue | 60-80% = Pauses naturelles | < 60% = Blocages possibles",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  },
  {
    icon: MessageCircleWarning,
    title: "Disfluences (Mots d'Appui)",
    description: "\"euh\", \"du coup\", \"en fait\" détectés automatiquement.",
    details: "L'algorithme identifie les disfluences en temps réel",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Type,
    title: "Comptage Syllabique",
    description: "Algorithme optimisé pour le français.",
    details: "Gestion des 'e' muets, contractions ('j'suis', 't'as')",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Activity,
    title: "Accélération max",
    description: "Vitesse maximale atteinte pendant la session.",
    details: "Un écart important entre la moyenne et le max peut révéler des accélérations involontaires — un indicateur clé en tachylalie et bredouillement.",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    icon: AudioWaveform,
    title: "Analyse du Bégaiement",
    description: "Détection acoustique des blocages, répétitions et allongements.",
    details: "🔴 Blocages (silences > 1s) • 🟡 Répétitions • 🟣 Allongements",
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
                SPS, Fluence, Fillers — Tout ce qu'il faut savoir
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
