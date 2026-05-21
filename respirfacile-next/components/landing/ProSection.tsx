import Link from "next/link"

export function ProSection() {
  const features = [
    {
      emoji: "📋",
      title: "Prescription en 2 minutes",
      desc: "4 profils prêts à l'emploi : SAOS léger, sévère sous CPAP, TMOF, mixte. Vous choisissez, vous envoyez le code. C'est tout.",
    },
    {
      emoji: "📓",
      title: "Journal de bord patient",
      desc: "Qualité du sommeil, bien-être, difficulté perçue. Vous voyez les signaux faibles avant qu'ils abandonnent.",
    },
    {
      emoji: "📈",
      title: "Graphiques semaine par semaine",
      desc: "Pause contrôlée, cohérence cardiaque, respiration nasale : chaque score tracé. La progression visible motive et vous informe.",
    },
    {
      emoji: "📄",
      title: "Bilan PDF pour le médecin",
      desc: "Rapport complet en un clic. Prêt pour le médecin du sommeil, le pneumologue, ou votre propre compte-rendu.",
    },
    {
      emoji: "🔔",
      title: "Alertes inactivité automatiques",
      desc: "Vous êtes notifié si un patient n'a pas pratiqué depuis 5 jours. Vous intervenez avant que la dynamique se perde.",
    },
    {
      emoji: "🔒",
      title: "Secret médical respecté",
      desc: "Hébergement Europe, chiffrement de bout en bout. Vos patients ne voient que leurs propres données. RGPD natif.",
    },
  ]
  return (
    <section id="fonctionnalites" className="py-24 px-4 bg-[#F5F0E8]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#8B4513] mb-3">Fonctionnalités</p>
          <h2 className="text-4xl md:text-5xl font-bold text-forest-800 mb-4">Tout pour suivre vos patients<br/>entre les séances</h2>
          <p className="text-xl text-forest-600 max-w-2xl mx-auto font-light">Conçu avec des orthophonistes spécialisées SAOS. Rien de superflu. Tout ce qui change vraiment la régularité.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {features.map((f) => (
            <div key={f.title} className="bg-beige-100 rounded-3xl p-7 border border-beige-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="font-bold text-forest-800 text-lg mb-2">{f.title}</h3>
              <p className="text-forest-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/auth?mode=signup&role=therapist"
            className="inline-flex items-center gap-2 bg-[#2D5016] hover:bg-[#1e3a0f] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Commencer mon essai gratuit
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
          <p className="text-sm text-forest-600 mt-3">30 jours gratuits · Sans carte bancaire · Résiliable à tout moment</p>
        </div>
      </div>
    </section>
  )
}
