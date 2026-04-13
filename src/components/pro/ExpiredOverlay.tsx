import { useState } from "react";
import { Lock, ShieldAlert, ArrowRight, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ExpiredOverlay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "essentiel" | "expert" | "premium") => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      return;
    }
    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/60 backdrop-blur-md py-8"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-4 p-6 sm:p-8 rounded-2xl bg-background border shadow-2xl text-center my-auto"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-2xl font-display font-bold mb-3">
          Période d'essai terminée
        </h2>

        <p className="text-muted-foreground mb-6">
          Vos données sont <strong>conservées en sécurité</strong>. 
          Abonnez-vous pour débloquer l'accès à vos patients et continuer le suivi.
        </p>

        {/* Pricing inline — chaque carte est cliquable */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handleSubscribe("essentiel")}
            disabled={loadingPlan !== null}
            className="p-4 rounded-xl border-2 border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-left disabled:opacity-50"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1">Essentiel</p>
            <p className="text-2xl font-bold text-foreground">14,90€</p>
            <p className="text-xs text-muted-foreground">/mois • 3 patients</p>
            {loadingPlan === "essentiel" && <Loader2 className="w-4 h-4 animate-spin mx-auto mt-2 text-primary" />}
          </button>
          <button
            onClick={() => handleSubscribe("expert")}
            disabled={loadingPlan !== null}
            className="p-4 rounded-xl border-2 border-primary/50 bg-primary/5 relative hover:border-primary hover:bg-primary/10 transition-all cursor-pointer text-left disabled:opacity-50"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
              <Star className="w-3 h-3" /> Populaire
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Expert</p>
            <p className="text-2xl font-bold text-foreground">19,90€</p>
            <p className="text-xs text-muted-foreground">/mois • 5 patients</p>
            {loadingPlan === "expert" && <Loader2 className="w-4 h-4 animate-spin mx-auto mt-2 text-primary" />}
          </button>
          <button
            onClick={() => handleSubscribe("premium")}
            disabled={loadingPlan !== null}
            className="p-4 rounded-xl border-2 border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-left disabled:opacity-50"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1">Premium</p>
            <p className="text-2xl font-bold text-foreground">29,90€</p>
            <p className="text-xs text-muted-foreground">/mois • 10 patients</p>
            {loadingPlan === "premium" && <Loader2 className="w-4 h-4 animate-spin mx-auto mt-2 text-primary" />}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
          <div className="flex items-center gap-3 justify-center text-green-700 dark:text-green-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-medium">Données patients 100% sécurisées</span>
          </div>
        </div>

        <Button 
          size="lg"
          onClick={() => navigate("/pro/subscription")}
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
        >
          Voir le détail des offres
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Preuve sociale */}
        <p className="text-xs text-muted-foreground mt-4 italic">
          "L'outil qu'il me manquait pour mesurer objectivement le débit." — Orthophoniste
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Annulation à tout moment
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ExpiredOverlay;
