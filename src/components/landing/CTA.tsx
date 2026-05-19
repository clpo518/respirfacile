import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative w-full bg-forest-dark py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Prêt à transformer la rééducation SAOS ?
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Rejoignez 40+ orthophonistes qui utilisent Respirfacile pour guider leurs patients au quotidien.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white hover:bg-sand text-forest-dark rounded-lg font-semibold"
              asChild
            >
              <a href="/auth?tab=signup">
                Commencer l'essai gratuit <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/60 text-white hover:bg-white/10 rounded-lg font-semibold"
              asChild
            >
              <a href="/contact">Nous contacter</a>
            </Button>
          </div>

          <p className="text-white/50 text-sm">
            Pas de carte bancaire requise. 30 jours d'accès complet. Annulez quand vous voulez.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
