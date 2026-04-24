import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function MethodSection() {
  const steps = [
    {
      number: 1,
      title: "L'ortho prescrit",
      description:
        'En 2 minutes, votre orthophoniste crée votre programme personnalisé et vous envoie votre code d\'accès.',
      details: [
        'Création du programme en cabinet',
        'Code patient généré automatiquement',
        'Partage sécurisé par mail/SMS',
      ],
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      title: 'Vous vous entraînez',
      description:
        '15 minutes par jour, guidé pas à pas. Pause Contrôlée, respiration nasale, exercices myofonctionnels.',
      details: [
        'Vidéos progressives et guidées',
        'Exercices adaptés à votre niveau',
        'Suivi automatique de l\'observance',
      ],
      color: 'from-teal-500 to-teal-600',
    },
    {
      number: 3,
      title: "L'ortho suit et ajuste",
      description:
        'Courbes de progression, observance en temps réel, bilan PDF exportable pour le médecin du sommeil.',
      details: [
        'Dashboard avec courbes de progression',
        'Observance en temps réel',
        'Bilan PDF pour le médecin',
      ],
      color: 'from-emerald-500 to-emerald-600',
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
    <section className="relative w-full bg-white py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un processus simple en 3 étapes. Prescrire, entraîner, suivre.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                {/* Step number circle */}
                <div
                  className={`absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg`}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="pt-4 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Details list */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow connector (hide on last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/3 text-gray-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-12 border border-blue-100"
        >
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Prêt à commencer ?
              </h3>
              <p className="text-gray-600 text-lg">
                Les orthos intéressés peuvent essayer gratuitement pendant 30 jours. Aucune carte bancaire requise.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg font-semibold"
                asChild
              >
                <a href="/pro/signup">Créer mon compte ortho</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg font-semibold border-2"
                asChild
              >
                <a href="/demo">Voir la démo</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
