"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Une erreur est survenue</h2>
        <p className="text-stone-500 mb-6">Impossible de charger les paramètres. Veuillez réessayer.</p>
        <button
          onClick={reset}
          className="bg-[#2D5016] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1F3810] transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
