"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StripeSetupFormProps {
  plan: "starter" | "pro" | "cabinet";
  therapistId: string;
}

const PLAN_LABELS = {
  starter: { name: "Starter", price: "15€/mois", patients: "5 patients" },
  pro: { name: "Pro", price: "30€/mois", patients: "20 patients" },
  cabinet: { name: "Cabinet", price: "55€/mois", patients: "Illimité" },
};

export default function StripeSetupForm({ plan, therapistId }: StripeSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const planInfo = PLAN_LABELS[plan];

  const handleStartTrial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, therapist_id: therapistId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du compte");
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        router.push("/therapist?trial_started=1");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800">Commencer votre essai gratuit</h2>
        <p className="text-stone-500 mt-2">30 jours gratuits, sans carte bancaire requise</p>
      </div>

      <div className="bg-[#F5F0E8] rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-stone-800">Plan {planInfo.name}</p>
            <p className="text-sm text-stone-500">{planInfo.patients}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#2D5016]">{planInfo.price}</p>
            <p className="text-xs text-stone-400">après l'essai</p>
          </div>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {[
          "✓ 30 jours d'accès complet gratuit",
          "✓ Aucune carte bancaire maintenant",
          "✓ Annulation possible à tout moment",
          "✓ Vos patients accèdent gratuitement",
        ].map((item) => (
          <li key={item} className="text-sm text-stone-600 flex items-center gap-2">{item}</li>
        ))}
      </ul>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleStartTrial}
        disabled={loading}
        className="w-full bg-[#2D5016] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#3d6b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Chargement...
          </>
        ) : (
          "Commencer gratuitement →"
        )}
      </button>

      <p className="text-center text-xs text-stone-400 mt-4">
        Votre carte sera demandée seulement à J+30. Vous recevrez un email 7 jours avant.
      </p>
    </div>
  );
}
