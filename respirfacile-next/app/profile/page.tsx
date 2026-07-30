import { LogoIcon } from "@/components/ui/Logo"
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BADGES } from "@/lib/badges";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Votre profil, vos badges et votre praticien référent.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Récupérer les infos du profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "patient") redirect("/");

  // Récupérer les stats (sessions, badges, etc.)
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: badges } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

  // Calculer les semaines actives (uniques)
  const weeksActive = new Set(
    (sessions || []).map((s) => {
      const date = new Date(s.created_at);
      const year = date.getFullYear();
      const week = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
      return `${year}-W${week}`;
    })
  ).size;

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "?";

  const createdDate = new Date(profile.created_at);
  const formattedDate = createdDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Métadonnées dérivées du catalogue unique. Cette page listait auparavant
  // des badges qui n'existaient nulle part ailleurs (streak_3, sessions_50,
  // early_bird…) : ils n'étaient donc jamais attribuables.
  const BADGE_META: Record<string, { emoji: string; label: string }> = Object.fromEntries(
    BADGES.map((badge) => [badge.id, { emoji: badge.emoji, label: badge.name }]),
  );

  // Mapper les IDs de diagnostiques
  const diagnosticLabel = {
    adult_saos_mild: "SAOS léger/modéré",
    adult_saos_severe: "SAOS sévère",
    adult_tmof: "TMOF pure",
    adult_mixed: "SAOS + TMOF",
  } as Record<string, string>;

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <LogoIcon size={28} />
              <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
            </Link>
          </div>
          <Link href="/dashboard" className="text-sm text-forest-500 hover:text-forest-700 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Avatar et infos principales */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar circulaire avec initiales */}
            <div className="w-24 h-24 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-beige-100">{initials}</span>
            </div>

            {/* Infos principales */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-forest-800 mb-2">
                {profile.full_name || "Patient"}
              </h1>
              <div className="space-y-2 text-forest-600">
                <p className="text-sm">
                  <span className="font-semibold text-forest-700">Email:</span> {user.email}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-forest-700">Inscrit(e) le :</span> {formattedDate}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-forest-700">Diagnostic :</span>{" "}
                  {profile.diagnostic_type
                    ? diagnosticLabel[profile.diagnostic_type as keyof typeof diagnosticLabel] ||
                      profile.diagnostic_type
                    : "Non renseigné"}
                </p>
              </div>

              {/* Bouton Modifier */}
              <Link
                href="/settings"
                className="inline-block mt-4 px-4 py-2 bg-copper text-white rounded-xl hover:bg-copper/90 transition-colors text-sm font-medium"
              >
                Modifier mes infos
              </Link>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Séances totales */}
          <div className="bg-beige-100 rounded-2xl border border-beige-300 shadow-beige p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-forest-600 mb-2">
                {sessions?.length || 0}
              </p>
              <p className="text-sm text-forest-600 font-medium">💪 Séances réussies</p>
            </div>
          </div>

          {/* Badges débloqués */}
          <div className="bg-beige-100 rounded-2xl border border-beige-300 shadow-beige p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-copper-600 mb-2">
                {badges?.length || 0}
              </p>
              <p className="text-sm text-forest-600 font-medium">🏅 Badges déverrouillés</p>
            </div>
          </div>

          {/* Semaines actives */}
          <div className="bg-beige-100 rounded-2xl border border-beige-300 shadow-beige p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-forest-600 mb-2">
                {weeksActive}
              </p>
              <p className="text-sm text-forest-600 font-medium">Semaines actives</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
            <h2 className="text-lg font-semibold text-forest-800 mb-6">🏆 Mes badges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge) => {
                const meta = BADGE_META[badge.badge_id] ?? {
                  emoji: "🏅",
                  label: badge.badge_id.replace(/_/g, " "),
                };
                return (
                  <div
                    key={badge.badge_id}
                    className="bg-gradient-to-br from-copper-100 to-copper-50 rounded-2xl border border-copper-200 p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="text-3xl mb-2">{meta.emoji}</div>
                    <p className="text-xs font-semibold text-copper-700">{meta.label}</p>
                    <p className="text-xs text-forest-500 mt-1">
                      {new Date(badge.earned_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
