import { Lock, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PatientExpiredOverlay = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-4 p-8 rounded-2xl bg-background border shadow-2xl text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-2xl font-display font-bold mb-3">
          Accès temporairement suspendu
        </h2>

        <p className="text-muted-foreground mb-6">
          L'abonnement de votre orthophoniste a expiré. Votre accès aux exercices est
          momentanément suspendu.
        </p>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
          <div className="flex items-center gap-3 justify-center text-green-700 dark:text-green-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">
              Vos données et votre historique sont conservés en sécurité
            </span>
          </div>
        </div>

        <div className="space-y-3 text-left mb-6">
          <h3 className="font-semibold text-sm text-foreground">Que pouvez-vous faire ?</h3>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Contactez votre orthophoniste</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Informez-le/la que votre accès a expiré. Dès le renouvellement de son abonnement,
                  tout redeviendra accessible instantanément.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Passez en Mode Autonomie</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Continuez vos exercices de manière indépendante avec 7 jours d'essai gratuit.
                  Rendez-vous dans vos Réglages pour vous délier.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/settings")}
          className="w-full gap-2"
        >
          Aller dans les Réglages
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Des questions ? Écrivez-nous à contact@parlermoinsvite.fr
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PatientExpiredOverlay;
