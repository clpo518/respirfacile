import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wind, ArrowLeft, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "15",
    seats: 10,
    tagline: "Parfait pour débuter",
    popular: false,
    features: [
      "Jusqu'à 10 patients",
      "Programmes personnalisés",
      "Suivi de l'observance",
      "Bilan PDF exportable",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "25",
    seats: 30,
    tagline: "Pour la plupart des praticiens",
    popular: true,
    features: [
      "Jusqu'à 30 patients",
      "Programmes personnalisés",
      "Suivi de l'observance & courbes",
      "Bilan PDF exportable",
      "Support prioritaire",
      "Webinaires pédagogiques",
      "Conseiller dédié",
    ],
  },
  {
    id: "cabinet",
    name: "Cabinet",
    price: "49",
    seats: -1, // illimité
    tagline: "Pour les cabinets multi-praticiens",
    popular: false,
    features: [
      "Patients illimités",
      "Multi-praticiens",
      "Suivi de l'observance & courbes",
      "Bilan PDF exportable",
      "Support 24/7",
      "Webinaires pédagogiques",
      "Intégration dossier patient",
    ],
  },
];

const ProSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/auth");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan: planId, priceType: "monthly" },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch {
      toast.error("Erreur lors de la création du paiement. Contactez-nous à contact@respirfacile.fr");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/patients")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Wind className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground">Abonnement PRO</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="pt-28 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                Tarification simple et transparente
              </div>
              <h1 className="font-display text-4xl font-semibold text-foreground mb-3">Choisissez votre formule</h1>
              <p className="text-muted-foreground">Sans engagement · Résiliation en 1 clic · Essai 30 jours gratuit</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-rf p-6 flex flex-col relative ${plan.popular ? "border-2 border-primary" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-xs px-3 py-1 rounded-full bg-primary text-white font-medium">Recommandé</span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h2 className="font-semibold text-foreground text-lg">{plan.name}</h2>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-semibold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.seats === -1 ? "Patients illimités" : `Jusqu'à ${plan.seats} patients`}
                    </p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loadingPlan}
                    className={`w-full py-3 flex items-center justify-center gap-2 ${plan.popular ? "btn-forest" : "btn-forest-outline"}`}
                  >
                    {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Choisir ce plan"}
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Question sur les tarifs ?{" "}
              <a href="mailto:contact@respirfacile.fr" className="text-primary hover:underline">contact@respirfacile.fr</a>
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProSubscription;
