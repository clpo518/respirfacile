import { motion } from "framer-motion";
import { MessageCircleQuestion, Zap, Shuffle, Mic, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const problems = [
  {
    icon: MessageCircleQuestion,
    title: "On vous fait souvent répéter ?",
    description: "Votre entourage perd le fil. Vous le voyez dans leurs yeux.",
  },
  {
    icon: Zap,
    title: "Vos idées fusent plus vite que vos mots ?",
    description: "Vous pensez à 200 km/h mais votre bouche décroche.",
  },
  {
    icon: Shuffle,
    title: "Sous stress, votre débit s'emballe ?",
    description: "Réunion, oral, appel important — vous perdez le contrôle.",
  },
];

const steps = [
  {
    icon: Mic,
    step: "1",
    title: "Parlez",
    description: "Choisissez un exercice — lecture guidée, oral libre, dialogue — et parlez dans votre micro.",
  },
  {
    icon: Eye,
    step: "2",
    title: "Voyez",
    description: "Un biofeedback visuel en temps réel vous montre votre débit. Vous comprenez immédiatement où ralentir.",
  },
  {
    icon: TrendingUp,
    step: "3",
    title: "Progressez",
    description: "Suivez votre évolution séance après séance. Partagez vos résultats avec votre orthophoniste.",
  },
];

export const ProblemSection = () => {
  return (
    <>
      {/* Problem section */}
      <section id="patients" className="py-20 md:py-28 bg-card">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vous vous reconnaissez ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Ces situations reviennent souvent quand on parle trop vite.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="bg-background rounded-2xl p-8 border border-border/50 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <problem.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/assessment">
                Faire l'auto-diagnostic gratuit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              3 étapes pour reprendre le contrôle
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Pas de théorie interminable. Vous parlez, vous voyez, vous progressez.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
