import { motion } from "framer-motion";
import { Activity, Timer, Mic, Sparkles, Dna } from "lucide-react";

const pillars = [
  {
    icon: Activity,
    title: "Articulation claire",
    description: "Exercices ciblés pour prononcer chaque syllabe distinctement et gagner en intelligibilité.",
  },
  {
    icon: Timer,
    title: "Rythme & pauses",
    description: "Apprenez à insérer des pauses naturelles entre vos phrases. Le biofeedback vous guide en temps réel.",
  },
  {
    icon: Mic,
    title: "Transfert en situation réelle",
    description: "Mode dialogue à 2 ou 3 voix, improvisation, virelangues — pratiquez comme dans la vraie vie.",
  },
];

export const MethodSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Approche clinique
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            3 axes pour retrouver la fluence
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Une méthode complète, adaptée au bredouillement, à la tachylalie et au bégaiement.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className="p-8 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <pillar.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Age calibration highlight */}
        <motion.div
          className="mt-14 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Dna className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-foreground mb-1.5">
                Objectifs adaptés à votre âge
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Un enfant, un ado et un adulte ne parlent pas à la même vitesse — c'est normal. 
                L'application calibre automatiquement vos objectifs selon les normes cliniques de Van Zaalen. 
                Fini les faux positifs frustrants.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
