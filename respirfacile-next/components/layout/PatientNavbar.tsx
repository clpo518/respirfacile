import Link from "next/link"
import { LogoIcon } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/server";

export async function PatientNavbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "";

  return (
    <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <LogoIcon size={28} />
            <span className="font-semibold text-base" style={{color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
          </Link>
          <div className="flex items-center gap-3">
            {firstName && (
              <span className="hidden sm:block text-sm text-forest-500">👋 {firstName}</span>
            )}
            <Link href="/settings" className="text-sm text-forest-500 hover:text-forest-700 transition-colors">
              ⚙️
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-forest-500 hover:text-forest-700 transition-colors">
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 border-t border-beige-300 pt-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-forest-700 hover:text-forest-900 px-3 pb-2 border-b-2 border-transparent hover:border-forest-500 transition-colors"
          >
            🏠 Accueil
          </Link>
          <Link
            href="/exercises"
            className="text-sm font-medium text-forest-700 hover:text-forest-900 px-3 pb-2 border-b-2 border-transparent hover:border-forest-500 transition-colors"
          >
            🏋️ Exercices
          </Link>
          <Link
            href="/history"
            className="text-sm font-medium text-forest-700 hover:text-forest-900 px-3 pb-2 border-b-2 border-transparent hover:border-forest-500 transition-colors"
          >
            📊 Progression
          </Link>
          <Link
            href="/journal"
            className="text-sm font-medium text-forest-700 hover:text-forest-900 px-3 pb-2 border-b-2 border-transparent hover:border-forest-500 transition-colors"
          >
            📓 Journal
          </Link>
          <Link
            href="/ressources"
            className="hidden sm:block text-sm font-medium text-forest-700 hover:text-forest-900 px-3 pb-2 border-b-2 border-transparent hover:border-forest-500 transition-colors"
          >
            📚 Ressources
          </Link>
        </nav>
      </div>
    </header>
  );
}
