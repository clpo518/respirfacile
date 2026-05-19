import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

export function ProSections() {
  const features = [
    {
      icon: BarChart3,
      title: 'Suivi de l\'observance',
      description:
        'Voir en temps réel qui fait ses exercices, qui a besoin d\'un coup de pouce. Dashboard intuitif avec courbes de progression par patient.',
      color: 'from-forest to-forest-light',
    },
    {
      icon: TrendingUp,
      title: 'Bilan PDF pour le médecin',
      description:
        'Exportez une synthèse de progression à partager avec le médecin du sommeil. IAH estimé, observance, remarques.',
      color: 'from-forest-light to-forest-muted',
    },
    {
      icon: Users,
      title: '30 exercices validés',
      description:
        'Pause Contrôlée, respiration nasale, myofonctionnel, cohérence cardiaque. Tous guidés vidéo, progressifs, adaptés au SAOS.',
      color: 'from-forest-muted to-forest/60',
    },
    {
      icon: CheckCircle2,
      title: 'Pas d\'engagement patient',
      description:
        'Accès gratuit pour les patients. Vous prescrivez un code, ils se connectent sans payer. Zéro friction, maximum d\'adhésion.',
      color: 'from-terra to-terra-light',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative w-full bg-background py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Outils puissants, interface simple
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tout ce qu'un orthophoniste a besoin pour guider ses patients en rééducation myofonctionnelle
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-forest/30 transition-all duration-300 hover:shadow-soft"
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pricing teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-forest/5 to-forest-muted/10 rounded-2xl p-12 border border-forest/15"
        >
          <div className="text-center space-y-6">
            <div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-3">
                Tarifs simples, sans surprise
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Essai 30 jours gratuit. Aucune carte bancaire requise. Accès complet à tous les outils.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    15€<span className="text-lg text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Starter (10 patients)</p>
                </div>
                <div className="hidden sm:block border-l border-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    25€<span className="text-lg text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Pro (30 patients)</p>
                </div>
                <div className="hidden sm:block border-l border-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    49€<span className="text-lg text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Cabinet (illimité)</p>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-primary hover:bg-forest-light text-primary-foreground rounded-lg font-semibold"
              asChild
            >
              <a href="/auth?tab=signup">Commencer l'essai gratuit</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
