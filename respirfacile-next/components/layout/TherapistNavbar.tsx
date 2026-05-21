import Link from "next/link"
import { LogoIcon } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/server";
import { TherapistNavTabs } from "@/components/layout/TherapistNavTabs";

export async function TherapistNavbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, subscription_status, trial_ends_at")
    .eq("id", user?.id ?? "")
    .single();

  const isTrialing = profile?.subscription_status === "trialing";
  let daysLeft = 0;
  if (isTrialing && profile?.trial_ends_at) {
    daysLeft = Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  return (
    <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Link href="/therapist" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <LogoIcon size={28} />
            <span className="font-semibold text-base" style={{color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
            <span className="hidden md:inline text-forest-400 text-xs ml-1">· Espace professionnel</span>
          </Link>

          <div className="flex items-center gap-3">
            {isTrialing && daysLeft > 0 && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-copper-500/10 border border-copper-500/30 text-copper-700 px-3 py-1.5 rounded-full hover:bg-copper-500/20 transition-colors"
              >
                ⏳ Essai, {daysLeft}j restants
              </Link>
            )}
            <Link
              href="/therapist/invite"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-beige-100 px-4 py-2 rounded-full hover:bg-forest-600 transition-colors"
            >
              ➕ Ajouter un patient
            </Link>
            <Link href="/settings" className="text-sm text-forest-500 hover:text-forest-700 transition-colors hidden md:block">
              Paramètres
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-forest-500 hover:text-forest-700 transition-colors">
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Navigation tabs — état actif géré côté client */}
        <TherapistNavTabs />
      </div>
    </header>
  );
}
