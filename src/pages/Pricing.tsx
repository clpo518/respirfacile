import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      monthly: 15,
      annual: 12,
      patients: '10 patients',
      description: 'Parfait pour débuter',
      features: [
        'Jusqu\'à 10 patients',
        'Suivi de l\'observance',
        'Dashboard complet',
        '30 exercices guidés',
        'Support email',
        'Bilan PDF exportable',
      ],
      cta: 'Commencer',
      highlighted: false,
    },
    {
      name: 'Pro',
      monthly: 25,
      annual: 20,
      patients: '30 patients',
      description: 'Pour la plupart des orthos',
      features: [
        'Jusqu\'à 30 patients',
        'Suivi de l\'observance',
        'Dashboard complet',
        '30 exercices guidés',
        'Support prioritaire',
        'Bilan PDF exportable',
        'Webinaires pédagogiques',
        'Conseiller dédié',
      ],
      cta: 'Commencer',
      highlighted: true,
    },
    {
      name: 'Cabinet',
      monthly: 49,
      annual: null,
      patients: 'Illimité',
      description: 'Pour les cabinets multi-praticiens',
      features: [
        'Patients illimités',
        'Multi-praticiens',
        'Suivi de l\'observance',
        'Dashboard complet',
        '30 exercices guidés',
        'Support 24/7',
        'Bilan PDF exportable',
        'Webinaires pédagogiques',
        'Conseiller dédié',
        'Intégration dossier patient',
      ],
      cta: 'Commencer',
      highlighted: false,
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
    <main className="w-full bg-white">
      {/* Header */}
      <section className="relative w-full bg-gradient-to-br from-gray-50 to-blue-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              30 jours d'essai gratuit. Aucune carte bancaire requise. Annulez quand vous voulez.
            </p>

            {/* Toggle button */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="text-sm text-gray-600">Facturation mensuelle</span>
              <div className="relative inline-block h-8 w-16 bg-gray-200 rounded-full">
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300" />
              </div>
              <span className="text-sm text-gray-600">
                Facturation annuelle{' '}
                <span className="font-semibold text-teal-600">Économisez 20%</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? 'ring-2 ring-gradient-to-r from-blue-500 to-teal-500 shadow-2xl scale-105'
                    : 'border border-gray-200'
                } ${plan.highlighted ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Highlighted badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Recommandé
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan name and description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.monthly}€
                      <span className="text-lg text-gray-600">/mois</span>
                    </div>
                    {plan.annual && (
                      <p className="text-sm text-gray-600 mt-2">
                        ou {plan.annual}€/mois annuel
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-4">
                      Jusqu'à <span className="font-semibold">{plan.patients}</span>
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={`w-full rounded-lg font-semibold mb-8 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                    asChild
                  >
                    <a href="/pro/signup">{plan.cta}</a>
                  </Button>

                  {/* Features list */}
                  <div className="space-y-4 border-t border-gray-200 pt-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 inline-block">
              <p className="text-gray-700">
                <span className="font-semibold">Tous les plans incluent :</span>
              </p>
              <p className="text-gray-600 mt-2">
                Accès patient gratuit · Données hébergées en France · RGPD conforme · Support personnalisé
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative w-full bg-gray-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Questions sur les tarifs
          </h2>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je essayer gratuitement ?
              </h3>
              <p className="text-gray-600">
                Oui, 30 jours gratuits avec accès complet. Aucune carte bancaire requise.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Dois-je payer avant la fin de l'essai ?
              </h3>
              <p className="text-gray-600">
                Non. Après 30 jours, vous serez facturé uniquement si vous continuez. Vous pouvez annuler à tout moment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Qu'est-ce qui change entre les plans ?
              </h3>
              <p className="text-gray-600">
                Le nombre de patients que vous pouvez gérer. Les fonctionnalités (suivi, exercices, bilan) sont identiques sur tous les plans. Le support s'améliore avec Starter → Pro → Cabinet.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Les patients paient-ils ?
              </h3>
              <p className="text-gray-600">
                Non, jamais. Vous payez pour vous. Les patients accèdent gratuitement avec le code que vous générez.
              </p>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg font-semibold"
              asChild
            >
              <a href="/pro/signup">Commencer mon essai gratuit</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
