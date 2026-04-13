import { motion } from "framer-motion";
import { Heart, Quote, ArrowRight, Building2, Users, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import founderImage from "@/assets/clement-founder.jpg";

interface FounderStorySectionProps {
  audience?: "patient" | "therapist";
}

export const FounderStorySection = ({ audience = "patient" }: FounderStorySectionProps) => {
  const isTherapist = audience === "therapist";
  
  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Notre Histoire
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {isTherapist ? (
                <>Créé par un <span className="text-primary">patient</span>, pour les professionnels.</>
              ) : (
                <>Je sais ce que vous vivez. <span className="text-primary">Je l'ai vécu aussi.</span></>
              )}
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
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-sm" />
                <div className="relative">
                  <img
                    src={founderImage}
                    alt="Clément, fondateur de ParlerMoinsVite"
                    className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="font-semibold text-foreground">Clément</p>
                    <p className="text-sm text-muted-foreground">Fondateur • Bredouilleur</p>
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
                <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/20" />
                <blockquote className="pl-8 text-xl md:text-2xl text-foreground font-medium italic leading-relaxed">
                  {isTherapist ? (
                    <>"Je sais ce que vivent vos patients. <span className="text-primary not-italic font-bold">Je suis l'un d'eux.</span>"</>
                  ) : (
                    <>"Pendant des années, on m'a dit de 'parler plus lentement'. 
                    Mais personne ne m'a montré <span className="text-primary not-italic font-bold">comment</span>."</>
                  )}
                </blockquote>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Je m'appelle Clément, et je vis avec le <strong className="text-foreground">bredouillement</strong> depuis l'enfance. 
                  Des idées qui fusent plus vite que mes mots. Des phrases qui se télescopent. 
                  Ce regard des autres quand ils ne comprennent pas.
                </p>
                
                <p>
                  En 2022, j'ai enfin consulté une orthophoniste formidable. Elle m'a appris les techniques. 
                  Mais entre les séances, j'étais seul. Pas d'outil pour m'entraîner. 
                  Pas de repère visuel. Juste un chronomètre et ma frustration.
                </p>

                <p className="text-foreground font-medium">
                  Alors j'ai créé l'outil que j'aurais voulu avoir.
                </p>

                {isTherapist ? (
                  <p>
                    <strong className="text-foreground">ParlerMoinsVite</strong> est né de cette expérience : 
                    offrir aux orthophonistes un outil qui parle le langage de leurs patients, 
                    avec des métriques cliniques rigoureuses (SPS Van Zaalen) et une expérience 
                    qui donne envie de s'entraîner.
                  </p>
                ) : (
                  <p>
                    <strong className="text-foreground">ParlerMoinsVite</strong>, c'est né de mes nuits de codage, de mes dizaines de séances d'entraînement, 
                    et de cette conviction : <em>si ça m'aide moi, ça peut aider d'autres.</em>
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link to={isTherapist ? "/auth" : "/assessment"}>
                    {isTherapist ? "Créer un compte Pro" : "Commencer mon entraînement"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* POCLE Company Section */}
        <motion.div
          className="max-w-4xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-8 md:p-10 rounded-2xl bg-card border border-border shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                L'équipe derrière ParlerMoinsVite
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Une entreprise solide, une mission claire
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">POCLE</h4>
                <p className="text-sm text-muted-foreground">
                  Entreprise française spécialisée dans les outils numériques de santé.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Équipe dédiée</h4>
                <p className="text-sm text-muted-foreground">
                  Développeurs, designers et conseillers cliniques travaillent ensemble.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Amélioration continue</h4>
                <p className="text-sm text-muted-foreground">
                  Mises à jour régulières basées sur les retours des utilisateurs et cliniciens.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                <strong className="text-foreground">ParlerMoinsVite</strong> est développé et maintenu par POCLE, 
                avec l'objectif d'aider chaque bredouilleur à reprendre confiance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
