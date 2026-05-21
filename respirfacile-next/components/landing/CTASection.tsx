import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-forest-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-forest-700/50 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-copper-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-copper-500/20 border border-copper-500/30 px-4 py-2 text-sm font-medium text-copper-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-copper-400 animate-pulse" />
          85 orthophonistes et kinés utilisent déjà Respirfacile
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-beige-100 mb-6 text-balance leading-tight">
          Vos patients méritent un suivi<br/>
          <span className="text-copper-400 italic">qui continue après la séance.</span>
        </h2>

        <p className="text-lg text-beige-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          30 jours d'essai gratuit, sans carte bancaire. Vos patients accèdent gratuitement via votre code. Vous ne payez que pour votre abonnement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/auth?mode=signup&role=therapist"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-beige-200 px-10 py-4 text-base font-bold text-forest-800 hover:bg-beige-100 transition-colors shadow-lg group"
          >
            Commencer l&apos;essai gratuit
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border-2 border-beige-400/50 px-10 py-4 text-base font-semibold text-beige-200 hover:border-beige-200 hover:text-white transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>

        <p className="text-sm text-beige-400">
          Sans CB · Sans engagement · Résiliable à tout moment · RGPD · Hébergement France
        </p>
      </div>
    </section>
  );
}
