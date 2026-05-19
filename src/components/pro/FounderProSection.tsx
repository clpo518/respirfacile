import { motion } from "framer-motion";
import { Heart, Quote, Stethoscope, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import founderImage from "@/assets/clement-founder.jpg";

export const FounderProSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-30" />
      
      <div className="container px-4 md:px-6 relative">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Pourquoi cet outil existe
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Conçu par un patient, <span className="text-primary">pour vos patients</span>.
            </h2>
          </motion.div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Photo Column */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Decorative frame */}
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/30 to-cyan-500/20 rounded-2xl blur-sm" />
                <div className="relative">
                  <img
                    src={founderImage}
                    alt="Clément, fondateur de RespirFacile"
                    className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl border border-slate-700/50"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700/50">
                    <p className="font-semibold text-white">Clément</p>
                    <p className="text-sm text-slate-400">Fondateur</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Story Column */}
            <motion.div
              className="lg:col-span-3 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/30" />
                <blockquote className="pl-8 text-xl md:text-2xl text-white font-medium italic leading-relaxed">
                  "Vous avez les compétences cliniques. Mais entre les séances, 
                  <span className="text-primary not-italic font-bold"> vos patients sont seuls</span>."
                </blockquote>
              </div>

              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Je m'appelle Clément. En 2022, j'ai commencé un suivi en <strong className="text-white">rééducation respiratoire</strong>.
                  Mon orthophoniste était formidable. Mais une fois rentré chez moi, je n'avais aucun outil
                  pour appliquer ce qu'elle m'enseignait.
                </p>

                <p>
                  <strong className="text-white">Pas de feedback visuel.</strong> Pas de mesure objective.
                  Juste des consignes écrites et l'espoir de "bien respirer"
                  sans savoir si je le faisais vraiment.
                </p>

                <p className="text-white font-medium">
                  J'ai créé RespirFacile pour combler ce vide.
                </p>

                <p>
                  Aujourd'hui, des dizaines de patients utilisent l'application entre leurs séances.
                  Leurs orthophonistes reçoivent des données objectives — scores de séance, durée de pratique, régularité —
                  sans effort supplémentaire.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-white">100+</span>
                  </div>
                  <p className="text-sm text-slate-400">Patients actifs</p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-white">20+</span>
                  </div>
                  <p className="text-sm text-slate-400">Orthophonistes</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button asChild size="lg" className="rounded-xl gap-2">
                  <Link to="/auth?tab=signup">
                    Créer mon compte Pro gratuit
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
