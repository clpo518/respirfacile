import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowLeft, Check, Users, Zap, Shield, Coffee, Loader2, UserPlus, Archive, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ProSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "essentiel" | "expert" | "premium") => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/auth");
      return;
    }

    setLoadingPlan(plan);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceType: "monthly",
          plan: plan,
        },
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

  const plans = [
    {
      id: "essentiel",
      name: "Offre 3 patients",
      price: "14,90",
      seats: 3,
      tagline: "L'équivalent de 3 cafés par mois.",
      features: [
        "3 comptes patients actifs",
        "Suivi en temps réel",
        "Analyse audio & waveforms",
        "Prescriptions à distance",
        "Notes cliniques privées",
        "Support inclus",
      ],
      popular: false,
    },
    {
      id: "expert",
      name: "Offre 5 patients",
      price: "19,90",
      seats: 5,
      tagline: "L'équivalent de 4 cafés par mois.",
      features: [
        "5 comptes patients actifs",
        "Suivi en temps réel",
        "Analyse audio & waveforms",
        "Prescriptions à distance",
        "Notes cliniques privées",
        "Support inclus",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Offre 10 patients",
      price: "29,90",
      seats: 10,
      tagline: "Pour les orthophonistes avec beaucoup de patients à suivre.",
      features: [
        "10 comptes patients actifs",
        "Suivi en temps réel",
        "Analyse audio & waveforms",
        "Prescriptions à distance",
        "Notes cliniques privées",
        "Support prioritaire",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/patient/list" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Abonnement Pro</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Tarification simple</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Choisissez votre formule
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Licence nominative par orthophoniste. Annulation à tout moment.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${
                  plan.popular 
                    ? "border-2 border-primary shadow-lg" 
                    : "border-border"
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        Populaire
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.tagline}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">{plan.price}€</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {plan.id === "essentiel" ? "3 cafés" : plan.id === "expert" ? "4 cafés" : "6 cafés"}
                        </span>
                      </div>
                    </div>

                    {/* Patient accounts highlight */}
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                      <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
                        <Users className="w-5 h-5" />
                        {plan.seats} Comptes Patients Actifs
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-emerald-500" : ""}`}
                      size="lg"
                      onClick={() => handleSubscribe(plan.id as "essentiel" | "expert" | "premium")}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Redirection...
                        </>
                      ) : (
                        `Choisir ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* How Patient Accounts Work */}
          <div className="mt-16 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold mb-2">
                Comment fonctionne le système de comptes patients ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Gérez votre file active en toute flexibilité. Archivez les patients en pause, réactivez-les quand ils reviennent.
              </p>
            </div>

            {/* Visual explanation */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative p-6 rounded-xl bg-muted/50 border border-border"
              >
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-center">Patients actifs</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Vos patients en cours de suivi utilisent un compte actif. Ils s'entraînent, vous suivez leur progression.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative p-6 rounded-xl bg-muted/50 border border-border"
              >
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
                  <Archive className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2 text-center">Archiver un patient</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Patient en pause ? Archivez-le en un clic. Ses données sont conservées, le compte est libéré.
                </p>
                <div className="mt-4 flex justify-center items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-muted-foreground/30 flex items-center justify-center opacity-50">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                  <Archive className="w-5 h-5 text-amber-500" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative p-6 rounded-xl bg-muted/50 border border-border"
              >
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-center">Rotation flexible</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Réactivez un patient archivé à tout moment. Gérez des dizaines de patients avec seulement 3 ou 5 comptes actifs.
                </p>
                <div className="mt-4 flex justify-center items-center gap-1">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-xs text-muted-foreground ml-2">∞ patients au total</span>
                </div>
              </motion.div>
            </div>

            {/* Key insight box */}
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">En pratique</h4>
                  <p className="text-sm text-muted-foreground">
                    Chaque offre correspond à un nombre de comptes patients actifs simultanés (3, 5 ou 10). 
                    Quand l'un termine sa rééducation, archivez-le et activez un nouveau patient. 
                    L'historique complet reste accessible pour les bilans.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-display font-bold text-center">
              Pourquoi les orthophonistes choisissent ParlerMoinsVite
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Assiduité documentée</h3>
                <p className="text-sm text-muted-foreground">
                  Visualisez l'engagement réel de vos patients entre les séances. Fini les "j'ai pas eu le temps".
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Métriques cliniques prêtes</h3>
                <p className="text-sm text-muted-foreground">
                  Courbes de débit, heatmaps syllabiques, analyses automatiques. Gagnez 20 min par bilan.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Prescriptions à distance</h3>
                <p className="text-sm text-muted-foreground">
                  Assignez des exercices personnalisés. Vos patients s'entraînent, vous suivez les résultats.
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-12">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Paiement sécurisé par carte bancaire
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Sans engagement
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Activation instantanée
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProSubscription;
