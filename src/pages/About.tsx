import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, Heart, Shield, Users, Stethoscope } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const VALUES = [
  { icon: Heart,       title: "Patient d'abord",     desc: "Chaque fonctionnalité est pensée pour réduire la friction du patient et maximiser l'adhérence thérapeutique." },
  { icon: Shield,      title: "Données privées",     desc: "Vos données de santé restent vôtres. Hébergement en France, zéro publicité, zéro revente." },
  { icon: Stethoscope, title: "Validé cliniquement", desc: "Les exercices sont conçus avec des orthophonistes et kinésithérapeutes spécialisés en pathologies du sommeil." },
  { icon: Users,       title: "Accessible à tous",   desc: "Interface simple, biofeedback visuel clair, adapté aux patients peu à l'aise avec la technologie." },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <button onClick={() => navigate("/auth")} className="btn-forest text-sm px-4 py-2">Connexion</button>
        </div>
      </header>

      <div className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp} className="text-center mb-16">
              <h1 className="font-display text-5xl font-semibold text-foreground mb-6">Notre mission</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Rendre la rééducation respiratoire accessible, engageante et efficace — entre les séances, à la maison.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="prose prose-lg max-w-none text-muted-foreground mb-16 space-y-4">
              <p>
                RespirFacile est née d'un constat simple : les patients atteints de SAOS ou de troubles myofonctionnels orofaciaux reçoivent des exercices respiratoires de leur praticien, mais peinent à les pratiquer régulièrement à la maison.
              </p>
              <p>
                Sans guidage visuel, sans suivi, et sans feedback immédiat, l'adhérence chute rapidement. Résultat : les progrès sont lents et les praticiens manquent de données pour ajuster le protocole.
              </p>
              <p>
                Nous avons construit RespirFacile pour combler ce vide — un outil de biofeedback visuel, simple à utiliser, qui guide le patient exercice par exercice et remonte les données de complétion au praticien.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-16">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-8 text-center">Nos valeurs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VALUES.map((v) => (
                  <div key={v.title} className="card-rf p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <v.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="card-rf p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wind className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Fait en France</h2>
              <p className="text-muted-foreground mb-6">
                RespirFacile est développé et hébergé en France. Les données de santé de vos patients ne quittent pas le territoire européen.
              </p>
              <button onClick={() => navigate("/contact")} className="btn-forest px-6 py-3">Nous contacter</button>
            </motion.div>

          </motion.div>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile · Fait avec 🌿 en France</p>
      </footer>
    </div>
  );
};

export default About;
