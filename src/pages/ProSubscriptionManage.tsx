import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wind, ArrowLeft, Users, Activity, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Stats {
  activePatients: number;
  totalSessions: number;
  subscriptionPlan: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter — 3 patients",
  pro:     "Pro — 10 patients",
  clinic:  "Clinique — 30 patients",
};

const ProSubscriptionManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/pro/subscription/manage` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Erreur lors de l'ouverture du portail de paiement. Contactez contact@respirfacile.fr");
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", user.id)
          .maybeSingle();

        const { data: patientLinks } = await supabase
          .from("therapist_patients")
          .select("patient_id")
          .eq("therapist_id", user.id)
          .eq("status", "active");

        let totalSessions = 0;
        if (patientLinks && patientLinks.length > 0) {
          const ids = patientLinks.map((p) => p.patient_id);
          const { count } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .in("user_id", ids);
          totalSessions = count || 0;
        }

        setStats({
          activePatients: patientLinks?.length || 0,
          totalSessions,
          subscriptionPlan: profile?.subscription_plan || null,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <span className="font-display font-semibold text-foreground">Mon abonnement</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="pt-28 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

            {/* Plan actuel */}
            <div className="card-rf p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Plan actuel</p>
                  <p className="font-semibold text-foreground">
                    {stats?.subscriptionPlan ? (PLAN_LABELS[stats.subscriptionPlan] || stats.subscriptionPlan) : "Essai gratuit"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="btn-forest-outline w-full py-3 flex items-center justify-center gap-2"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Gérer la facturation (Stripe)
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-rf p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-semibold text-foreground">{stats?.activePatients ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Patients actifs</p>
              </div>
              <div className="card-rf p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-semibold text-foreground">{stats?.totalSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Séances réalisées</p>
              </div>
            </div>

            {/* Upgrade */}
            {(!stats?.subscriptionPlan || stats.subscriptionPlan === "starter") && (
              <div className="card-rf p-6 border-2 border-primary/30 text-center">
                <p className="font-semibold text-foreground mb-2">Besoin de plus de patients ?</p>
                <p className="text-sm text-muted-foreground mb-4">Passez au plan Pro (10 patients) ou Clinique (30 patients).</p>
                <button onClick={() => navigate("/pro/subscription")} className="btn-forest px-6 py-2">
                  Voir les plans →
                </button>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Question sur votre abonnement ?{" "}
              <a href="mailto:contact@respirfacile.fr" className="text-primary hover:underline">contact@respirfacile.fr</a>
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProSubscriptionManage;
