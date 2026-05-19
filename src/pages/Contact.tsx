import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, Mail, Stethoscope, User, MessageSquare } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.10 } } };

const Contact = () => {
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
        <div className="container mx-auto max-w-2xl">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h1 className="font-display text-5xl font-semibold text-foreground mb-4">Contactez-nous</h1>
              <p className="text-xl text-muted-foreground">Une question, un retour, une suggestion ? On vous répond sous 24h.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">

              {/* Professionnels */}
              <motion.div variants={fadeUp} className="card-rf p-6 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Professionnels de santé</h3>
                  <p className="text-sm text-muted-foreground mb-3">Démo, questions sur l'abonnement PRO, intégration dans votre pratique.</p>
                  <a href="mailto:contact@respirfacile.fr" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Mail className="w-4 h-4" />
                    contact@respirfacile.fr
                  </a>
                </div>
              </motion.div>

              {/* Patients */}
              <motion.div variants={fadeUp} className="card-rf p-6 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Patients</h3>
                  <p className="text-sm text-muted-foreground mb-3">Problème de connexion, question sur un exercice, accès à votre compte.</p>
                  <a href="mailto:contact@respirfacile.fr" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Mail className="w-4 h-4" />
                    contact@respirfacile.fr
                  </a>
                </div>
              </motion.div>

              {/* Général */}
              <motion.div variants={fadeUp} className="card-rf p-6 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Général & presse</h3>
                  <p className="text-sm text-muted-foreground mb-3">Partenariats, presse, tout autre sujet.</p>
                  <a href="mailto:contact@respirfacile.fr" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Mail className="w-4 h-4" />
                    contact@respirfacile.fr
                  </a>
                </div>
              </motion.div>

            </div>

            <motion.div variants={fadeUp} className="mt-10 text-center text-sm text-muted-foreground">
              Réponse garantie sous 24h les jours ouvrés · Basé en France 🌿
            </motion.div>
          </motion.div>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile</p>
      </footer>
    </div>
  );
};

export default Contact;
