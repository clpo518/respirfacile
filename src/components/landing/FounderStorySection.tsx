import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import founderImage from '@/assets/clement-founder.jpg';

export function FounderStorySection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-sand to-sand/40 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={founderImage}
                alt="Clément, fondateur de RespirFacile"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Right: Story content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Pourquoi j'ai créé Respirfacile
              </h2>
            </div>

            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                J'ai moi-même souffert d'apnée du sommeil. La CPAP fonctionnait, mais je ne supportais pas de dormir avec un masque toutes les nuits.
              </p>

              <p>
                Quand j'ai découvert que <span className="font-semibold">93% des patients SAOS ne connaissent pas la thérapie myofonctionnelle</span>, j'ai voulu changer ça.
              </p>

              <p>
                J'ai parlé avec des orthophonistes. Ils m'ont dit : <span className="italic">"Je sais que ça marche, mais mes patients n'en font qu'une fois par semaine. Pour vraiment changer les choses, ils doivent s'entraîner tous les jours."</span>
              </p>

              <p>
                C'est comme ça que Respirfacile est né. Utiliser la technologie pour transformer un problème de santé en quelque chose de mesurable, quotidien, et durable.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-muted-foreground">
                <span className="font-semibold">Clément</span>, fondateur
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-forest-light text-primary-foreground rounded-lg font-semibold"
                  asChild
                >
                  <a href="/auth?tab=signup">Rejoindre le mouvement</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg font-semibold border-2 border-forest/30 hover:bg-forest/5"
                  asChild
                >
                  <a href="mailto:contact@respirfacile.fr">Me contacter</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
