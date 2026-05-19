import { motion } from 'framer-motion';
import { AlertCircle, Users, Brain } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: AlertCircle,
      title: 'La CPAP : efficace mais abandonnée',
      description:
        'Plus de 50% des patients arrêtent la CPAP dans l\'année. La rééducation myofonctionnelle offre une alternative.',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Users,
      title: '93% des patients ignorent l\'OMT',
      description:
        'La thérapie myofonctionnelle réduit l\'IAH de 50% en moyenne. Pourtant, presque personne n\'en a entendu parler.',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: Brain,
      title: 'L\'orthophoniste seul ne suffit pas',
      description:
        '1 séance par semaine ne suffit pas. Le patient doit s\'entraîner tous les jours. Mais comment savoir s\'il le fait ?',
      color: 'from-forest to-forest-light',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section className="relative w-full bg-muted/40 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
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
            Le SAOS touche 3 millions de Français.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              80% ne sont pas diagnostiqués.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Le problème n'est pas le diagnostic, c'est la prise en charge. Voici trois obstacles qu'on peut surmonter.
          </p>
        </motion.div>

        {/* Problems grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-forest/30 transition-all duration-300 hover:shadow-soft"
              >
                {/* Gradient accent line */}
                <div
                  className={`absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r ${problem.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${problem.color}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {problem.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-muted-foreground mb-6">
            La thérapie myofonctionnelle n'est pas une mode — c'est de la science.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-forest/5 rounded-lg border border-forest/15">
            <span className="text-sm font-semibold text-forest-dark">
              Basé sur 9 études cliniques • Méta-analyse Stanford 2015, n=120
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
