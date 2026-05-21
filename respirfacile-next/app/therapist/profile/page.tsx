import { LogoIcon } from "@/components/ui/Logo"
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Mon profil | Respirfacile",
};

export default async function TherapistProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Compter les patients actifs
  const { count: patientCount } = await supabase
    .from("therapist_patients")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "active");

  // Sessions ce mois
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);

  const { data: monthlySessions } = await supabase
    .from("sessions")
    .select("id")
    .eq("therapist_id", user.id)
    .gte("created_at", monthStart.toISOString());

  const sessionCount = monthlySessions?.length || 0;

  const firstName = profile?.full_name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/therapist" className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
          </Link>
          <Link href="/therapist" className="text-sm text-forest-500 hover:text-forest-700 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Titre */}
        <h1 className="font-display text-3xl font-bold text-forest-800 mb-8">
          {firstName ? `Mon profil, ${firstName}` : "Mon profil"}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6 text-center">
            <p className="text-xs text-forest-400 uppercase tracking-wider font-semibold mb-2">Patients actifs</p>
            <p className="font-display text-4xl font-bold text-forest-800">{patientCount || 0}</p>
          </div>
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6 text-center">
            <p className="text-xs text-forest-400 uppercase tracking-wider font-semibold mb-2">Séances (30j)</p>
            <p className="font-display text-4xl font-bold text-forest-800">{sessionCount}</p>
          </div>
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6 text-center">
            <p className="text-xs text-forest-400 uppercase tracking-wider font-semibold mb-2">Abonnement</p>
            <p className="font-medium text-forest-800 capitalize">
              {profile?.subscription_tier || "Essai"}
            </p>
          </div>
        </div>

        {/* Code Pro */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
          <h2 className="font-semibold text-lg text-forest-800 mb-4">Code Pro</h2>
          <div className="bg-forest-800 rounded-2xl px-6 py-4">
            <p className="font-mono font-bold text-beige-100 text-2xl tracking-widest text-center">
              {profile?.therapist_code || "—"}
            </p>
          </div>
          <p className="text-sm text-forest-600 mt-4">
            Partagez ce code à vos patients pour qu'ils s'inscrivent et soient immédiatement liés à votre tableau de bord.
          </p>
        </div>

        {/* Abonnement */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
          <h2 className="font-semibold text-lg text-forest-800 mb-4">Abonnement</h2>
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Plan actuel</p>
              <p className="text-forest-800 font-medium capitalize">
                {profile?.subscription_tier || "Essai gratuit"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Statut</p>
              <p className="text-forest-800">
                {profile?.subscription_status === "trialing"
                  ? "En essai gratuit"
                  : profile?.subscription_status === "active"
                  ? "Actif"
                  : profile?.subscription_status === "canceled"
                  ? "Annulé"
                  : "—"}
              </p>
            </div>
            {profile?.trial_ends_at && (
              <div>
                <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Essai gratuit jusqu'au</p>
                <p className="text-forest-800">
                  {new Date(profile.trial_ends_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
          <Link
            href="/pricing"
            className="inline-block rounded-full border-2 border-copper-500 bg-copper-500 px-6 py-2.5 text-sm font-semibold text-beige-100 hover:bg-copper-600 hover:border-copper-600 transition-colors"
          >
            Mettre à niveau →
          </Link>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <Link
            href="/therapist"
            className="block text-sm font-semibold text-forest-600 hover:text-forest-800 transition-colors"
          >
            ← Retour au tableau de bord
          </Link>
          <Link
            href="/settings"
            className="block text-sm font-semibold text-forest-600 hover:text-forest-800 transition-colors"
          >
            Paramètres →
          </Link>
        </div>
      </main>
    </div>
  );
}
