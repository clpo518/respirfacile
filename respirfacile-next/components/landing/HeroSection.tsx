"use client"
import Link from "next/link"

export function HeroSection() {
  const stats = [
    { value: "15 min", label: "par jour suffisent" },
    { value: "8 sem.", label: "pour les premiers résultats" },
    { value: "30 j.", label: "d'essai gratuit" },
  ]
  return (
    <section className="relative pt-16 pb-24 px-4 overflow-hidden" style={{background: "linear-gradient(160deg, #F5F0E8 0%, #EDE5D4 100%)"}}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none" style={{background: "radial-gradient(circle, #2D5016 0%, transparent 70%)", transform: "translate(40%, -40%)"}} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{background: "radial-gradient(circle, #8B4513 0%, transparent 70%)", transform: "translate(-40%, 40%)"}} />

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-forest-700/10 text-forest-700 text-sm font-semibold px-4 py-2 rounded-full mb-7 border border-forest-700/15">
            <span>🩺</span>
            <span>Pour les orthophonistes et kinésithérapeutes</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-forest-800 leading-[1.08] mb-6 tracking-tight">
            Respirez mieux.{" "}
            <span className="text-forest-700">Ensemble.</span>
          </h1>

          <p className="text-xl md:text-2xl text-forest-700 leading-relaxed mb-4 max-w-2xl mx-auto font-light">
            Prescrivez un programme respiratoire personnalisé. Vos patients le suivent chaque jour depuis leur téléphone. Graphiques, scores, séances réalisées, vous voyez concrètement ce qui s&apos;améliore.
          </p>

          <p className="text-base text-forest-600 mb-10 max-w-xl mx-auto">
            15 min par jour. Guidé, mesuré, suivi. Sans rendez-vous supplémentaire.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth?mode=signup&role=therapist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Essayer gratuitement · 30 jours →
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <Link
              href="/auth?mode=signup&role=patient"
              className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-beige-400 text-forest-700 hover:border-forest-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
            >
              J&apos;ai un code patient
            </Link>
          </div>
          <p className="text-sm text-forest-500 mt-5">Sans carte bancaire · Sans engagement · Données sécurisées</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-lg mx-auto mb-5">
          {stats.map((s) => (
            <div key={s.value} className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 text-center border border-white shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-forest-700">{s.value}</div>
              <div className="text-xs text-forest-600 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-forest-500 text-center">*Source : étude clinique publiée dans CHEST (2009)</p>
      </div>
    </section>
  )
}