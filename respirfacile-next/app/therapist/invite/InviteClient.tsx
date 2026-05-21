"use client";

import { LogoIcon } from "@/components/ui/Logo"
import { useState } from "react";
import Link from "next/link";

interface InviteClientProps {
  therapistCode: string;
}

export function InviteClient({ therapistCode }: InviteClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(therapistCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-beige-200 bg-texture flex flex-col">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/therapist" className="inline-flex items-center gap-2.5 text-forest-600 hover:text-forest-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
          </Link>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-beige-100 rounded-4xl border-2 border-beige-300 p-10 shadow-beige">
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl font-bold text-forest-800 mb-3">
                🔗 Invitez vos patients en 30 secondes
              </h1>
              <p className="text-forest-600 max-w-lg mx-auto">
                Partagez votre code Pro unique. Vos patients s'inscrivent gratuitement et apparaissent immédiatement dans votre tableau de bord.
              </p>
            </div>

            {/* Code PRO Card */}
            <div className="bg-gradient-to-br from-forest-700 to-forest-800 rounded-3xl p-10 mb-10 text-center shadow-lg">
              <p className="text-xs text-beige-300 uppercase tracking-widest font-semibold mb-4">
                💳 Votre code Pro unique
              </p>
              <p className="font-mono font-bold text-beige-100 text-6xl tracking-widest mb-8 break-words">
                {therapistCode}
              </p>
              <button
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  copied
                    ? "bg-forest-500 text-beige-100"
                    : "bg-copper-500 hover:bg-copper-600 text-beige-100 shadow-copper"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copié !
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier le code
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-5">
              <h2 className="font-semibold text-forest-800 text-lg">📋 Comment ça marche</h2>

              <ol className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-copper-500 text-beige-100 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-forest-800">Partagez ce code à votre patient</p>
                    <p className="text-sm text-forest-600 mt-1">
                      Par SMS, email, ou donnez-le directement en consultation. Copiez-collez depuis le bloc ci-dessus.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-copper-500 text-beige-100 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-forest-800">Votre patient va sur respirfacile.fr</p>
                    <p className="text-sm text-forest-600 mt-1">
                      Il clique sur le bouton &quot;J&apos;ai un code Pro&quot; sur la page d&apos;accueil ou lors de l&apos;inscription.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-copper-500 text-beige-100 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-forest-800">Il entre le code et crée son compte</p>
                    <p className="text-sm text-forest-600 mt-1">
                      En moins de 2 minutes, le compte est créé. Il accède immédiatement à respirfacile.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-copper-500 text-beige-100 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-forest-800">Vérifiez votre tableau de bord</p>
                    <p className="text-sm text-forest-600 mt-1">
                      Votre patient apparaît immédiatement dans votre liste. Vous voyez son activité en temps réel, exportez son bilan PDF, etc.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Info box */}
            <div className="mt-8 bg-forest-500/10 border border-forest-500/20 rounded-2xl px-4 py-3 text-sm text-forest-700">
              <strong>💚 Rappel :</strong> Vos patients accèdent complètement gratuitement via votre code Pro. Seul votre abonnement ortho est payant.
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-8 border-t border-beige-300 flex gap-4">
              <Link
                href="/therapist"
                className="flex-1 text-center py-3 rounded-full border-2 border-forest-500 text-forest-600 font-semibold hover:bg-forest-500/10 transition-colors"
              >
                ← Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

}
