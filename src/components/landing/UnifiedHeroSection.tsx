import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function UnifiedHeroSection() {
  const [pauseValue, setPauseValue] = useState(12);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      setPauseValue((prev) => {
        if (prev >= 26) {
          // Pause 2 s à 26 avant de repartir à 12
          timeout = setTimeout(() => setPauseValue(12), 2000);
          return 26;
        }
        return prev + 0.5;
      });
    };

    const interval = setInterval(tick, 700);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-sand via-sand/60 to-white pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-forest/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-forest-muted/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-forest/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            {/* Badge */}
            <Badge variant="secondary" className="w-fit">
              SAOS · Ronflement · Respiration buccale · TMOF
            </Badge>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Respirez mieux.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest to-forest-light">
                  Dormez mieux.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                La rééducation qui fait la différence.
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Exercices de thérapie myofonctionnelle guidés par votre orthophoniste. 15 min par jour. Des résultats mesurables.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-forest-light text-primary-foreground rounded-lg font-semibold"
                asChild
              >
                <a href="/auth?tab=signup">
                  Je commence avec mon code <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg font-semibold border-2 border-forest/30 hover:bg-forest/5"
                asChild
              >
                <a href="/pro">Je suis orthophoniste</a>
              </Button>
            </div>
          </motion.div>

          {/* Right column: Pause Contrôlée widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="relative w-full max-w-sm">
              <div className="bg-card rounded-2xl shadow-2xl p-12 border border-border">
                <div className="text-center space-y-8">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Pause nasale
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Durée de pause maîtrisée · résultat réel
                    </p>
                  </div>

                  {/* Animated pause value */}
                  <motion.div
                    className="space-y-1"
                  >
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-forest to-forest-light">
                      {Math.round(pauseValue)}
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">secondes</p>
                    <p className="text-xs text-muted-foreground">après 8 semaines d'exercices</p>
                  </motion.div>

                  {/* Progress bar */}
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-forest to-forest-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${((pauseValue - 12) / 14) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Départ · 12 sec</span>
                      <span>Objectif · 26 sec</span>
                    </div>
                  </div>

                  {/* Week indicators */}
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">Semaine {Math.round(((pauseValue - 12) / 14) * 8) + 1} / 8</p>
                    <div className="flex gap-1 justify-center">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 rounded-full bg-muted"
                          initial={{ width: 12 }}
                          animate={{
                            width: ((pauseValue - 12) / 14) * 100 > (i * 12.5) ? 12 : 8,
                            backgroundColor:
                              ((pauseValue - 12) / 14) * 100 > (i * 12.5)
                                ? '#2D5A4F'
                                : '#e5e7eb',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">250+</div>
            <p className="text-sm text-muted-foreground mt-2">Patients actifs</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">40+</div>
            <p className="text-sm text-muted-foreground mt-2">Orthophonistes inscrits</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">-50%</div>
            <p className="text-sm text-muted-foreground mt-2">IAH en moyenne</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">8</div>
            <p className="text-sm text-muted-foreground mt-2">Semaines programme type</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
