export function ProblemSection() {
  return (
    <section className="py-24 px-4 bg-forest-900 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-copper-400 mb-3">Le problème que vous connaissez</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">La rééducation fonctionne.<br/>Sauf quand elle ne se fait pas.</h2>
          <p className="text-xl text-beige-200 max-w-2xl mx-auto font-light">
            Vous prescrivez les bons exercices. Vos patients acquiescent. Et entre deux séances : rien. La motivation s'effondre, les progrès stagnent, vous repartez de zéro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {[
            {
              emoji: "🗓️",
              title: "\"J'ai oublié de faire mes exercices\"",
              desc: "Vos patients ont bonne volonté en séance. Mais sans rappel ni guidage quotidien, la routine ne s'installe jamais.",
            },
            {
              emoji: "📉",
              title: "Aucune visibilité entre les séances",
              desc: "Vous savez ce qui s'est passé pendant les 45 min en cabinet. Les 167 heures suivantes, c'est une zone d'ombre.",
            },
            {
              emoji: "🔁",
              title: "Vous repartez de zéro à chaque séance",
              desc: "Sans suivi quotidien, le patient régresse. Vous corrigez au lieu d'avancer. La progression est deux fois plus lente.",
            },
            {
              emoji: "😮‍💨",
              title: "Impossible de savoir qui a vraiment pratiqué",
              desc: "\"Oui j'ai fait mes exercices\", mais combien de fois ? Avec quelle régularité ? Sans données, impossible d'ajuster le programme.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-forest-800 border border-forest-700 rounded-3xl p-7 hover:bg-forest-700 transition-colors">
              <div className="text-3xl mb-4">{item.emoji}</div>
              <h3 className="font-bold text-lg mb-2 text-beige-100">{item.title}</h3>
              <p className="text-beige-200 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-8 md:p-10 text-center border border-[#2D5016]/40" style={{background: "linear-gradient(135deg, #2D5016 0%, #1e3a0f 100%)"}}>
          <p className="text-2xl font-bold mb-3 text-white">Respirfacile ferme cette brèche.</p>
          <p className="text-beige-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Vos patients ont un coach dans la poche. Vous avez les données sur votre tableau de bord. <strong className="text-white">La rééducation continue entre les séances.</strong>
          </p>
        </div>
      </div>
    </section>
  )
}
