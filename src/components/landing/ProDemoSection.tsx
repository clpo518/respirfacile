import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KaraokeDemo } from "./KaraokeDemo";

const rebusItems = [
  { emoji: "🐮", label: "vache", pauseAfter: true },
  { emoji: "🍽️", label: "mange", pauseAfter: true },
  { emoji: "🍦", label: "glace", pauseAfter: false },
];

export const ProDemoSection = () => {
  const [activeWord, setActiveWord] = useState(0);
  const [activeRebus, setActiveRebus] = useState(-1);
  const words = ["Je", "prends", "le", "temps", "de", "parler."];

  const animateWords = () => {
    setActiveWord(0);
    words.forEach((_, index) => {
      setTimeout(() => setActiveWord(index), index * 800);
    });
  };

  const animateRebus = () => {
    setActiveRebus(-1);
    let delay = 0;
    rebusItems.forEach((item, index) => {
      setTimeout(() => setActiveRebus(index), delay);
      delay += item.pauseAfter ? 1400 : 800;
    });
  };

  return (
    <section id="demo" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            Démo interactive
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Voici ce que vos patients <span className="text-primary">utiliseront</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3 modes parmi les 12 disponibles. Vos patients s'exercent en autonomie entre deux séances.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 md:p-10">
            <Tabs defaultValue="lecture" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="lecture" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                  Lecture<span className="hidden sm:inline"> guidée</span>
                </TabsTrigger>
                <TabsTrigger value="dialogue" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  Dialogue
                  <span className="hidden sm:inline ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase">
                    Nouveau
                  </span>
                </TabsTrigger>
                <TabsTrigger value="rebus" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  🖼️ Rébus<span className="hidden sm:inline"> enfant</span>
                </TabsTrigger>
              </TabsList>

              {/* Lecture guidée tab */}
              <TabsContent value="lecture">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                    <Play className="w-4 h-4" />
                    Mode Lecture — Guidage thérapeutique
                  </span>
                  <p className="text-muted-foreground text-sm">
                    Le surligneur avance mot par mot et s'adapte à la vitesse cible du patient (de 3.0 à 5.0 syll/s). Le patient lit à voix haute en suivant le rythme.
                  </p>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-border/60 bg-card mb-6">
                  <KaraokeDemo />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Modes", value: "Libre / Guidé / Syllabique" },
                    { label: "Biofeedback", value: "SPS en temps réel" },
                    { label: "Adapté", value: "Enfant → Senior" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                      <div className="text-xs font-semibold text-foreground mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  👆 Cliquez pour lancer. Le surligneur avance au rythme recommandé (~4 syll/s).
                </p>
              </TabsContent>

              {/* Dialogue tab */}
              <TabsContent value="dialogue">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                    <MessageSquare className="w-4 h-4" />
                    Mode Dialogue — Transfert en situation réelle
                  </span>
                  <p className="text-muted-foreground text-sm">
                    Le patient pose le téléphone et discute. Un seul gros indicateur visuel guide le débit en temps réel.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="w-44 h-44 rounded-full border-4 border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-5xl">✅</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Parfait</span>
                    <span className="text-xs text-muted-foreground">4.0 syll/s</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                    {[
                      { emoji: "🐢", label: "Trop lent", color: "border-sky-300" },
                      { emoji: "✅", label: "Zone cible", color: "border-emerald-500" },
                      { emoji: "⚡", label: "Trop rapide", color: "border-amber-500" },
                    ].map((state, i) => (
                      <div key={i} className={`text-center p-3 rounded-xl border-2 ${state.color} bg-card`}>
                        <span className="text-2xl">{state.emoji}</span>
                        <div className="text-[11px] text-muted-foreground mt-1">{state.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Durée", value: "30s à 5 min" },
                    { label: "Situations", value: "Boulangerie, RDV…" },
                    { label: "Objectif", value: "Transfert des acquis" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                      <div className="text-xs font-semibold text-foreground mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  💬 L'emoji change en temps réel selon le débit du patient — visible de loin, sans stress.
                </p>
              </TabsContent>

              {/* Rebus enfant tab */}
              <TabsContent value="rebus">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-3">
                    🖼️ Mode Rébus — Patients non-lecteurs (4-7 ans)
                  </span>
                  <p className="text-muted-foreground text-sm">
                    L'enfant regarde les images et répète à voix haute, en soufflant entre chaque image.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-end gap-6 mb-8">
                  {rebusItems.map((item, index) => (
                    <motion.div key={index} className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <motion.span
                          className={`text-5xl md:text-7xl transition-all duration-300 ${
                            index === activeRebus ? "scale-110" : index <= activeRebus ? "opacity-100" : "opacity-40"
                          }`}
                          animate={index === activeRebus ? { scale: [1, 1.15, 1.1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {item.emoji}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>

                      {item.pauseAfter && (
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((bar) => (
                            <motion.div
                              key={bar}
                              className="w-1.5 rounded-full bg-orange-400"
                              animate={
                                index === activeRebus
                                  ? { height: [16, 28, 16], opacity: [0.5, 1, 0.5] }
                                  : { height: 16, opacity: 0.3 }
                              }
                              transition={{ duration: 0.6, delay: bar * 0.15, repeat: index === activeRebus ? 1 : 0 }}
                              style={{ height: 16 }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <button
                    onClick={animateRebus}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-lg shadow-orange-500/25"
                  >
                    <Play className="w-5 h-5" />
                    Lancer la démo
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Âge cible", value: "4–7 ans" },
                    { label: "Exercices", value: "30+ thèmes" },
                    { label: "Modélisation", value: "🐢 Lent / 🐇 Rapide" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                      <div className="text-xs font-semibold text-foreground mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  🖼️ Pas besoin de savoir lire : les emojis guident la parole, les barres orange marquent les pauses respiratoires.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
