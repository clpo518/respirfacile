import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture flex flex-col items-center justify-center px-4 text-center py-12">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-forest-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-3">404</p>
        <h1 className="font-display text-4xl font-bold text-forest-800 mb-4">
          😕 Page introuvable
        </h1>
        <p className="text-forest-600 text-lg max-w-sm mx-auto leading-relaxed mb-8">
          Cette page n'existe pas. Retournez à l'accueil pour continuer.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-forest-500 px-8 py-3 text-base font-semibold text-beige-100 hover:bg-forest-600 transition-colors shadow-sm"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/exercises"
          className="rounded-full border-2 border-forest-500 px-8 py-3 text-base font-semibold text-forest-700 hover:border-forest-600 hover:text-forest-800 transition-colors"
        >
          Mes exercices
        </Link>
      </div>
    </div>
  );
}
