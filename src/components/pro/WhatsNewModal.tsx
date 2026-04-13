import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CURRENT_VERSION = "2025-06-target-sps";

const WhatsNewModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("whats_new_seen");
    if (seen !== CURRENT_VERSION) {
      // Small delay so it doesn't compete with other modals
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("whats_new_seen", CURRENT_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Nouveauté !</DialogTitle>
          </div>
          <DialogDescription className="sr-only">Nouvelle fonctionnalité disponible</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Feature highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/15">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Objectif SPS personnalisé</h3>
                <p className="text-sm text-muted-foreground">Visible sur toutes les courbes</p>
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              Vous pouvez maintenant définir un <strong>objectif de vitesse personnalisé</strong> pour 
              chaque patient. Il apparaît comme <strong>ligne de référence</strong> sur tous les 
              graphiques d'évolution — côté patient et dans sa fiche.
            </p>

            <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3 border border-border/50">
              <TrendingDown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                L'indicateur <strong>"% dans la cible"</strong> s'adapte aussi à cet objectif. 
                Vos patients voient d'un coup d'œil s'ils respectent <em>leur</em> cible personnelle.
              </p>
            </div>
          </motion.div>

          {/* How to use */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border/50"
          >
            <p>
              <strong className="text-foreground">💡 Comment ça marche ?</strong><br />
              Ouvrez la fiche d'un patient et cliquez sur <em>Modifier</em> à côté de l'objectif de vitesse. 
              La cible recommandée est <em>vitesse habituelle − 1 syll/s</em>.
            </p>
          </motion.div>
        </div>

        <Button onClick={handleClose} className="w-full mt-1">
          C'est noté !
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal;
