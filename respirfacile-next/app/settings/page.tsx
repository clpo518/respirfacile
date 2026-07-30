import { LogoIcon } from "@/components/ui/Logo"
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SettingsNameForm } from "./SettingsNameForm";
import { SettingsPasswordForm } from "./SettingsPasswordForm";
import { SettingsDiagnosticForm } from "./SettingsDiagnosticForm";
import { SignOutButton } from "./SignOutButton";
import { CopyCodeButton } from "./CopyCodeButton";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  const backHref = isTherapist ? "/therapist" : "/dashboard";

  const roleLabel = profile?.role === "therapist"
    ? "Orthophoniste"
    : profile?.role === "kine"
    ? "Kinésithérapeute"
    : profile?.role === "patient"
    ? "Patient"
    : profile?.role || "--";

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href={backHref} className="flex items-center gap-2.5">
              <LogoIcon size={28} />
              <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
            </Link>
          </div>
          <Link href={backHref} className="text-sm text-forest-500 hover:text-forest-700 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-forest-800 mb-8">Paramètres</h1>

        {/* Profil */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
          <h2 className="font-semibold text-lg text-forest-800 mb-6">Profil</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">Nom complet</p>
              <SettingsNameForm initialName={profile?.full_name} userId={user.id} />
            </div>
            <div>
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-forest-800">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Role</p>
              <p className="text-forest-800">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Mon diagnostic (patients only) */}
        {!isTherapist && (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
            <h2 className="font-semibold text-lg text-forest-800 mb-6">Mon diagnostic</h2>
            <p className="text-sm text-forest-600 mb-4">
              Sélectionnez votre type de diagnostic pour personnaliser votre programme.
            </p>
            <SettingsDiagnosticForm
              initialDiagnostic={profile?.diagnostic_type}
              userId={user.id}
            />
          </div>
        )}

        {/* Code Pro */}
        {isTherapist && profile?.therapist_code && (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
            <h2 className="font-semibold text-lg text-forest-800 mb-4">Code Pro</h2>
            <p className="text-sm text-forest-600 mb-4">
              Partagez ce code à vos patients pour qu'ils accèdent gratuitement à Respirfacile.
            </p>
            <div className="flex items-center gap-4 bg-forest-800 rounded-2xl px-6 py-4">
              <p className="font-mono font-bold text-beige-100 text-xl tracking-widest flex-1">
                {profile.therapist_code}
              </p>
              <CopyCodeButton code={profile.therapist_code} />
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
          <h2 className="font-semibold text-lg text-forest-800 mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-forest-800">Rappels d'exercices quotidiens</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-forest-800">Mises à jour de mon programme</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-forest-800">Conseils et articles santé</span>
            </label>
          </div>
        </div>

        {/* Abonnement (therapists only) */}
        {isTherapist && (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
            <h2 className="font-semibold text-lg text-forest-800 mb-4">Abonnement</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Plan</p>
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
                    : profile?.subscription_status === "past_due"
                    ? "En retard de paiement"
                    : profile?.subscription_status || "--"}
                </p>
              </div>
              {profile?.trial_ends_at && (
                <div>
                  <p className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-1">Essai gratuit jusqu'au</p>
                  <p className="text-forest-800">
                    {new Date(profile.trial_ends_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
              <Link
                href="/pricing"
                className="inline-block text-sm font-semibold text-copper-500 hover:text-copper-600 transition-colors mt-2"
              >
                Voir les tarifs -&gt;
              </Link>
            </div>
          </div>
        )}

        {/* Sécurité */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 mb-4">
          <h2 className="font-semibold text-lg text-forest-800 mb-6">Sécurité</h2>
          <SettingsPasswordForm />
        </div>

        {/* Compte */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
          <h2 className="font-semibold text-lg text-forest-800 mb-4">Compte</h2>
          <div className="space-y-4">
            <div>
              <SignOutButton />
            </div>
            <div className="pt-4 border-t border-beige-300">
              <a
                href="mailto:contact@respirfacile.fr"
                className="text-sm text-forest-500 hover:text-forest-700 transition-colors"
              >
                Supprimer mon compte
              </a>
              <p className="text-xs text-forest-400 mt-1">
                Contactez contact@respirfacile.fr pour supprimer votre compte.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
