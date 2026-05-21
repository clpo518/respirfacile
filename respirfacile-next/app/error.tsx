"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-8">
            <p className="text-[#8B4513] text-sm font-semibold uppercase tracking-widest mb-3">
              ⚠️ Problème technique
            </p>
            <h1 className="text-4xl font-bold text-stone-800 mb-4">
              Hmm, on a un souci
            </h1>
            <p className="text-stone-600 max-w-sm mx-auto">
              Un problème technique inattendu s&apos;est produit. Réessaye ou retourne à l&apos;accueil.
            </p>
            {error.digest && (
              <p className="text-xs text-stone-500 mt-3">
                Référence : {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={reset}
              className="rounded-full bg-[#2D5016] text-white px-6 py-3 text-sm font-semibold hover:bg-[#1e3a0f] transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-full border border-stone-300 text-stone-700 px-6 py-3 text-sm font-semibold hover:bg-stone-100 transition-colors"
            >
              Accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
