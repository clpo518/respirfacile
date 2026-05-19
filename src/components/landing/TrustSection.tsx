import { motion } from "framer-motion";
import { Activity, Shield, Eye, Stethoscope, Award, Heart } from "lucide-react";

const trustBadges = [
  {
    icon: Heart,
    label: "Conçu avec des orthophonistes spécialisés",
    isHighlight: true,
  },
  {
    icon: Activity,
    label: "Exercices guidés en temps réel",
  },
  {
    icon: Eye,
    label: "Retour visuel motivant",
  },
  {
    icon: Stethoscope,
    label: "Approche clinique evidence-based",
  },
  {
    icon: Shield,
    label: "Données sécurisées (RGPD)",
  },
  {
    icon: Award,
    label: "Prescrit par les orthophonistes",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-8 bg-muted/50 border-y border-border/50">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm md:text-base">
            Approche basée sur les recommandations de l'
            <span className="font-semibold text-foreground">International Association of Logopedics and Phoniatrics (IALP)</span>
            {" "}en rééducation oro-myo-fonctionnelle et respiratoire.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 ${
                'isHighlight' in badge && badge.isHighlight
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                'isHighlight' in badge && badge.isHighlight
                  ? "bg-primary/20"
                  : "bg-primary/10"
              }`}>
                <badge.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
