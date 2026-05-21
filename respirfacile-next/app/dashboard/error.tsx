"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-beige-200 bg-texture flex flex-col">
      <div className="h-16 bg-beige-100/90 border-b border-beige-300" />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Erreur du tableau de bord
          </p>
          <h1 className="font-display text-3xl font-bold text-forest-800 mb-3">
            Impossible de charger votre tableau de bord
          </h1>
          <p className="text-forest-600 mb-8">
            Nous avons rencontré un problème en chargeant vos données. Veuillez réessayer ou
            retourner à l&apos;accueil.
          </p>
          {error.digest && (
            <p className="text-xs text-forest-500 mb-6 p-3 bg-beige-100 rounded-lg">
              Ref: {error.digest}
            </p>
          )}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={reset}
              className="rounded-full bg-forest-500 text-beige-100 px-6 py-3 text-sm font-semibold hover:bg-forest-600 transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-full border border-forest-400 text-forest-700 px-6 py-3 text-sm font-semibold hover:bg-beige-300 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
