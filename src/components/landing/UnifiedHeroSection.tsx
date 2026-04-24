import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function UnifiedHeroSection() {
  const [pauseValue, setPauseValue] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setPauseValue((prev) => (prev >= 26 ? 12 : prev + 0.5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-white pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
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
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Respirez mieux.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                  Dormez mieux.
                </span>
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                La rééducation qui fait la différence.
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
              Exercices de thérapie myofonctionnelle guidés par votre orthophoniste. 15 min par jour. Des résultats mesurables.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg font-semibold"
                asChild
              >
                <a href="/auth">
                  Je commence avec mon code <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg font-semibold border-2"
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
              <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100">
                <div className="text-center space-y-8">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Pause Contrôlée
                    </p>
                    <p className="text-xs text-gray-400">
                      Progression sur 8 semaines
                    </p>
                  </div>

                  {/* Animated pause value */}
                  <motion.div
                    key={Math.floor(pauseValue)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                      {Math.round(pauseValue)}
                    </div>
                    <p className="text-lg text-gray-600 font-medium">secondes</p>
                  </motion.div>

                  {/* Progress bar */}
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-teal-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((pauseValue - 12) / 14) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>12 sec</span>
                      <span>26 sec</span>
                    </div>
                  </div>

                  {/* Week indicators */}
                  <div className="pt-4 space-y-2">
                    <p className="text-xs text-gray-400">Semaines de progression</p>
                    <div className="flex gap-1 justify-center">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 rounded-full bg-gray-200"
                          initial={{ width: 12 }}
                          animate={{
                            width: ((pauseValue - 12) / 14) * 100 > (i * 12.5) ? 12 : 8,
                            backgroundColor:
                              ((pauseValue - 12) / 14) * 100 > (i * 12.5)
                                ? 'rgb(59, 130, 246)'
                                : 'rgb(229, 231, 235)',
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
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-12"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900">250+</div>
            <p className="text-sm text-gray-600 mt-2">Patients actifs</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900">40+</div>
            <p className="text-sm text-gray-600 mt-2">Orthophonistes inscrits</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900">-50%</div>
            <p className="text-sm text-gray-600 mt-2">IAH en moyenne</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900">8</div>
            <p className="text-sm text-gray-600 mt-2">Semaines programme type</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
