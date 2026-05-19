import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function UnifiedFAQ() {
  const faqs = [
    {
      question: 'Est-ce que mes patients doivent payer ?',
      answer:
        'Non. L\'accès patient est totalement gratuit via votre Code Pro. Les patients accèdent aux exercices sans frais, sans inscription, sans limite d\'utilisation.',
    },
    {
      question: 'Faut-il un diagnostic SAOS pour utiliser l\'app ?',
      answer:
        'Non. L\'app est indiquée aussi pour la respiration buccale et le ronflement sans diagnostic officiel. Elle complète aussi les traitements CPAP. Si c\'est de la rééducation myofonctionnelle, c\'est pertinent.',
    },
    {
      question: "L'app remplace-t-elle les séances en cabinet ?",
      answer:
        "Non — elle les prolonge. L'orthophoniste prescrit et ajuste en cabinet, l'app guide le patient entre les séances. C'est du renforcement quotidien qui rend les séances plus efficaces.",
    },
    {
      question: 'Est-ce scientifiquement validé ?',
      answer:
        'Oui. Basé sur la méta-analyse Camacho et al. 2015 (Stanford, n=120 adultes) : réduction de l\'IAH de 50% en moyenne avec la thérapie myofonctionnelle. 9 études cliniques supportent l\'approche.',
    },
    {
      question: 'L\'app est-elle conforme RGPD ?',
      answer:
        'Oui. Données hébergées en France (Supabase, région eu-west-1). Aucune donnée médicale partagée sans consentement explicite. Conformité certifiée.',
    },
    {
      question: 'Puis-je l\'utiliser si je ne pratique pas encore la TMOF ?',
      answer:
        'Oui. L\'app inclut des protocoles guidés et des ressources pédagogiques pour les orthophonistes qui débutent. Des webinaires et un support personnalisé sont inclus dans tous les plans.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section className="relative w-full bg-muted/40 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tout ce que vous devez savoir sur Respirfacile pour les orthophonistes
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card hover:border-forest/30 transition-colors duration-200"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">Vous avez d'autres questions ?</p>
          <a
            href="mailto:contact@respirfacile.fr"
            className="inline-flex items-center gap-2 text-primary hover:text-forest-light font-semibold"
          >
            Contactez-nous directement
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
