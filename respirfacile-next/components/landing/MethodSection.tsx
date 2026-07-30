export function MethodSection() {
  const steps = [
    {
      num: "01",
      emoji: "📋",
      title: "Vous configurez le programme en 2 minutes",
      desc: "4 profils patients prêts à l'emploi (SAOS léger, SAOS sévère, TMOF, mixte). Vous choisissez, vous envoyez un code. Le patient s'inscrit gratuitement.",
      color: "#2D5016",
    },
    {
      num: "02",
      emoji: "🫁",
      title: "Le patient pratique guidé chaque jour",
      desc: "Minuteur, consignes affichées étape par étape, score enregistré à la fin. 15 minutes par jour, sans que vous ayez à relancer.",
      color: "#8B4513",
    },
    {
      num: "03",
      emoji: "📊",
      title: "Vous voyez tout depuis votre tableau de bord",
      desc: "Séances réalisées, scores, régularité, journal de bord. Alerte automatique si un patient n'a pas pratiqué depuis 5 jours. Bilan PDF en un clic.",
      color: "#2D5016",
    },
  ]
  return (
    <section id="methode" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-copper-500 mb-3">Comment ça marche</p>
          <h2 className="text-4xl md:text-5xl font-bold text-forest-800 mb-4">Vous prescrivez.<br/>Respirfacile s'occupe du reste.</h2>
          <p className="text-xl text-forest-600 max-w-xl mx-auto font-light">Pas de formation, pas d'installation. Opérationnel en moins de 5 minutes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className="bg-beige-100 rounded-3xl p-8 h-full border border-beige-300/50 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl font-bold text-beige-400 leading-none">{step.num}</span>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-forest-800 mb-3">{step.title}</h3>
                <p className="text-forest-700 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-[#2D5016] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-xl mb-1">Ce que disent les études</p>
            <p className="text-beige-200 text-sm max-w-xl">
              Sur des formes légères à modérées, la thérapie myofonctionnelle réduit l&apos;indice d&apos;apnées-hypopnées
              d&apos;environ 50 % (Camacho et al., 2015). Toutes les études butent sur le même point : la régularité du
              patient entre deux séances. C&apos;est là que Respirfacile intervient, et nulle part ailleurs.
            </p>
          </div>
          <a
            href="#preuves"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-2xl border border-beige-200/40 px-6 py-4 text-beige-100 font-semibold hover:bg-white/10 transition-colors"
          >
            Les 3 références, avec leurs limites →
          </a>
        </div>
      </div>
    </section>
  )
}
