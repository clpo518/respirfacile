import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function FounderStorySection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-gray-50 to-blue-50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image/Avatar area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 shadow-2xl flex items-center justify-center">
              <div className="text-8xl">👨‍💼</div>
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
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pourquoi j'ai créé Respirfacile
              </h2>
            </div>

            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                J'ai fondé parlermoinsvite.fr pour les personnes qui bégaient. En deux ans, on a aidé 500+ utilisateurs à retrouver confiance en eux.
              </p>

              <p>
                Quand j'ai découvert que <span className="font-semibold">93% des patients SAOS ne connaissent pas la thérapie myofonctionnelle</span>, j'ai voulu changer ça.
              </p>

              <p>
                J'ai parlé avec des orthophonistes. Ils m'ont dit : <span className="italic">"Je sais que ça marche, mais mes patients n'en font qu'une fois par semaine. Pour vraiment changer les choses, ils doivent s'entraîner tous les jours."</span>
              </p>

              <p>
                C'est comme ça que Respirfacile est né. Même approche que parlermoinsvite.fr — utiliser la technologie pour transformer un problème de santé en quelque chose de mesurable et durable.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                <span className="font-semibold">Clément Poirier</span>, fondateur
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg font-semibold"
                  asChild
                >
                  <a href="/pro/signup">Rejoindre le mouvement</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-lg font-semibold border-2"
                  asChild
                >
                  <a href="mailto:clement@respirfacile.fr">Me contacter</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
