import { motion } from "framer-motion";
import { Check, Stethoscope, ArrowRight, Gift, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const PricingTeaser = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            Accès complet inclus
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Gratuit pour les patients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Votre orthophoniste prend en charge l'abonnement. Vous bénéficiez de toutes les fonctionnalités.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Single Card - Patient Access */}
          <motion.div
            className="relative bg-background rounded-2xl p-8 md:p-10 border-2 border-primary shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Tout est inclus
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Accès Patient Complet
              </h3>
              <p className="text-muted-foreground">
                Inclus dans l'abonnement de votre orthophoniste
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                "+60 exercices variés : lecture, oral libre, rébus…",
                "Mesure de vitesse en temps réel (SPS)",
                "Détection des disfluences (euh, du coup...)",
                "Historique et courbes de progression",
                "Partage audio avec votre orthophoniste",
                "Objectifs personnalisés selon votre âge",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button className="hover:scale-105 transition-transform duration-200" size="lg" asChild>
                <Link to="/auth?tab=signup">
                  Créer mon compte patient
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Vous aurez besoin du code Pro de votre orthophoniste
              </p>
            </div>
          </motion.div>

          {/* B2C Solo option */}
          <motion.div
            className="mt-6 relative bg-background rounded-2xl p-8 border border-amber-500/30 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Pas d'orthophoniste ?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Commencez avec <strong>7 jours d'essai gratuit</strong>, puis un abonnement simple sans engagement.
                </p>
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                  <RotateCcw className="w-3 h-3" />
                  Sans engagement — annulez quand vous voulez
                </p>
                <p className="text-xs text-muted-foreground">
                  ☕ Une équipe dédiée, des exercices mis à jour et l'hébergement sécurisé de vos données.
                </p>
              </div>
              <Button variant="outline" className="border-amber-500/50 hover:bg-amber-500/10" asChild>
                <Link to="/auth?tab=signup">
                  Essayer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Therapist Banner */}
          <motion.div
            className="mt-6 p-6 bg-muted/50 rounded-xl border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  Vous êtes orthophoniste ?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Essai gratuit de 30 jours. Gérez jusqu'à 10 patients avec un seul abonnement.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/">
                  Découvrir l'offre Pro
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
