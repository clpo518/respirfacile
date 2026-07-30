import { LogoIcon } from "@/components/ui/Logo"
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réinitialiser votre mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture flex flex-col">
      {/* Minimal nav */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-beige-100 rounded-4xl shadow-forest-lg border border-beige-300 p-8 md:p-10">
            {/* Back link */}
            <Link href="/auth" className="inline-flex items-center gap-2 mb-6 text-forest-500 hover:text-forest-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Retour</span>
            </Link>

            {/* Header */}
            <h1 className="font-display text-3xl font-bold text-forest-800 mb-2">
              🔐 Réinitialiser votre mot de passe
            </h1>
            <p className="text-forest-500 text-sm mb-8">
              Entrez votre adresse électronique : vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>

            {/* Form */}
            <form className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-2xl border border-beige-400 bg-beige-50 px-4 py-3 text-sm text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-colors"
                  placeholder="vous@exemple.fr"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full rounded-full bg-forest-500 hover:bg-forest-600 py-4 text-sm font-semibold text-beige-100 transition-colors"
              >
                Envoyer le lien de réinitialisation
              </button>
            </form>

            {/* Help text */}
            <p className="text-center text-xs text-forest-400 mt-6">
              Vous allez recevoir un email avec un lien pour réinitialiser votre mot de passe. Suivez les instructions dans le lien pour créer un nouveau mot de passe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
