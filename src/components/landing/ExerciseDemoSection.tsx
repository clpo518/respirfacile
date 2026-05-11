import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, MessageSquare } from "lucide-react";
import { KaraokeDemo } from "./KaraokeDemo";

const rebusItems = [
  { emoji: "🐮", label: "vache", pauseAfter: true },
  { emoji: "🍽️", label: "mange", pauseAfter: true },
  { emoji: "🍦", label: "glace", pauseAfter: false },
];

export const ExerciseDemoSection = () => {
  const [activeRebus, setActiveRebus] = useState(-1);

  const animateRebus = () => {
    setActiveRebus(-1);
    let delay = 0;
    rebusItems.forEach((item, index) => {
      setTimeout(() => setActiveRebus(index), delay);
      delay += item.pauseAfter ? 1400 : 800;
    });
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Voyez par vous-même
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            3 de nos 12 modes d'exercice. Chacun cible un aspect différent de la fluence.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 md:p-10">
            <Tabs defaultValue="lecture" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="lecture" className="gap-1.5 text-xs md:text-sm">
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Lecture guidée</span>
                </TabsTrigger>
                <TabsTrigger value="dialogue" className="gap-1.5 text-xs md:text-sm">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Dialogue</span>
                </TabsTrigger>
                <TabsTrigger value="rebus" className="gap-1.5 text-xs md:text-sm">
                  <span className="shrink-0">🧒</span>
                  <span className="truncate">Enfants</span>
                </TabsTrigger>
              </TabsList>

              {/* Lecture */}
              <TabsContent value="lecture" className="mt-0">
                <div className="rounded-xl overflow-hidden border border-border/40 bg-card mb-4">
                  <KaraokeDemo />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Le surligneur avance mot par mot à la vitesse que <strong className="text-foreground">vous</strong> choisissez. Ralentissez naturellement.
                </p>
              </TabsContent>

              {/* Dialogue */}
              <TabsContent value="dialogue" className="mt-0">
                <div className="flex flex-col items-center gap-5 py-6">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center">
                        <span className="text-3xl">✅</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">3.8 syll/s</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1.5">Vous</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full border-4 border-orange-400 bg-orange-400/10 flex flex-col items-center justify-center">
                        <span className="text-3xl">⚡</span>
                        <span className="text-xs font-bold text-orange-500 dark:text-orange-400 mt-0.5">5.2 syll/s</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1.5">Interlocuteur</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Chaque personne reçoit <strong className="text-foreground">sa propre jauge</strong>. Idéal en séance ou en famille.
                  </p>
                  <a
                    href="/auth?tab=signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Essayer le Mode Dialogue
                  </a>
                </div>
              </TabsContent>

              {/* Rébus */}
              <TabsContent value="rebus" className="mt-0">
                <div className="flex flex-wrap justify-center items-end gap-5 py-6 mb-4">
                  {rebusItems.map((item, index) => (
                    <motion.div key={index} className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <motion.span
                          className={`text-4xl md:text-5xl transition-all duration-300 ${
                            index === activeRebus ? "scale-110" : index <= activeRebus ? "opacity-100" : "opacity-40"
                          }`}
                          animate={index === activeRebus ? { scale: [1, 1.15, 1.1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {item.emoji}
                        </motion.span>
                        <span className="text-[11px] text-muted-foreground">{item.label}</span>
                      </div>
                      {item.pauseAfter && (
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((bar) => (
                            <motion.div
                              key={bar}
                              className="w-1.5 rounded-full bg-orange-400"
                              animate={
                                index === activeRebus
                                  ? { height: [14, 26, 14], opacity: [0.5, 1, 0.5] }
                                  : { height: 14, opacity: 0.3 }
                              }
                              transition={{ duration: 0.6, delay: bar * 0.15, repeat: index === activeRebus ? 1 : 0 }}
                              style={{ height: 14 }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mb-3">
                  <button
                    onClick={animateRebus}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all shadow-md"
                  >
                    <Play className="w-4 h-4" />
                    Lancer la démo
                  </button>
                </div>
                <p className="text-sm text-muted-foreground text-center font-medium mb-1">
                  « La vache mange une glace »
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Pas besoin de savoir lire — les emojis guident la parole. Dès 4 ans.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
