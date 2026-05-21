"use client"

import { useState } from "react"

interface Props {
  plan: "starter" | "pro" | "cabinet"
  therapistId: string
}

const PLAN_LABELS: Record<Props["plan"], string> = {
  starter: "Starter, 15€/mois",
  pro: "Pro, 30€/mois",
  cabinet: "Cabinet, 55€/mois",
}

export default function StripeSetupForm({ plan, therapistId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, therapist_id: therapistId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      // If Stripe returns a checkout URL, redirect
      if (data.url) {
        window.location.href = data.url
        return
      }

      // If no redirect needed (e.g. trial without card)
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inattendue"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-green-800 mb-1">Essai démarré !</h3>
        <p className="text-green-700 text-sm">
          Votre essai gratuit de 30 jours est activé. Aucune carte bancaire requise pour l'instant.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Plan recap */}
      <div className="rounded-xl bg-[#f5f0e8] border border-[#e8e0d0] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Plan sélectionné</p>
            <p className="font-semibold text-stone-800">{PLAN_LABELS[plan]}</p>
          </div>
          <div className="bg-[#2D5016] text-white text-xs font-medium px-3 py-1.5 rounded-full">
            30j gratuits
          </div>
        </div>
      </div>

      {/* Trial info */}
      <div className="flex items-start gap-3 text-sm text-stone-600">
        <span className="text-xl leading-none">🔒</span>
        <p>
          <strong>30 jours gratuits, sans carte bancaire requise.</strong> Votre CB sera demandée
          uniquement à l'expiration du trial si vous souhaitez continuer.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-[#2D5016] hover:bg-[#1e3a0f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Activation en cours…
          </>
        ) : (
          <>Démarrer mon essai gratuit →</>
        )}
      </button>

      <p className="text-xs text-center text-stone-400">
        Résiliable à tout moment · Aucun engagement · Données sécurisées
      </p>
    </div>
  )
}
