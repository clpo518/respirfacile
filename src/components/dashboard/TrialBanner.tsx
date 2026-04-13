import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TrialBannerProps {
  hasActiveTrial: boolean;
  trialDaysRemaining: number | null;
  isSolo: boolean;
  isPremium: boolean;
}

const TrialBanner = ({ hasActiveTrial, trialDaysRemaining, isSolo, isPremium }: TrialBannerProps) => {
  const { session } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Don't show for non-solo users or premium users
  if (!isSolo || isPremium) return null;

  const handleSubscribe = async () => {
    if (!session?.access_token) {
      toast.error("Veuillez vous connecter pour vous abonner");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan: "b2c" },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Trial expired
  if (!hasActiveTrial) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-destructive/30 bg-destructive/5 mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              <div>
                  <h3 className="font-semibold text-sm">Essai terminé</h3>
                  <p className="text-xs text-muted-foreground">
                    Abonnez-vous pour continuer à utiliser tous les exercices et le suivi de progression.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="gap-2 shrink-0"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
              <Crown className="w-4 h-4" />
                )}
                S'abonner — 9€/mois
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Active trial
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-amber-500/30 bg-amber-500/5 mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  Mode Autonomie — Essai gratuit
                </h3>
                <p className="text-xs text-muted-foreground">
                  {trialDaysRemaining !== null && trialDaysRemaining > 0
                    ? `${trialDaysRemaining} jour${trialDaysRemaining > 1 ? "s" : ""} restant${trialDaysRemaining > 1 ? "s" : ""}`
                    : "Dernier jour d'essai"
                  }
                  {" · "}Vous pouvez rattacher un orthophoniste dans les Réglages
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="gap-2 shrink-0"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
              <Crown className="w-4 h-4" />
              )}
              S'abonner — 9€/mois
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            💡 Moins de 2 cafés par mois pour soutenir une équipe dédiée, des exercices mis à jour régulièrement et un hébergement sécurisé de vos données.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrialBanner;
