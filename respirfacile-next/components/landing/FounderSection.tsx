export function FounderSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#8B4513] mb-5">Le fondateur</p>
            <h2 className="text-4xl font-bold text-forest-800 mb-5 leading-tight">
              Je fais déjà ça<br />pour la parole.
            </h2>
            <p className="text-forest-700 leading-relaxed mb-5 text-lg">
              Je m&apos;appelle Clément. J&apos;ai créé <strong>parlermoinsvite.fr</strong>, une application de
              rééducation du débit de parole utilisée par des orthophonistes et leurs patients. J&apos;y ai appris une
              chose simple : ce qui bloque, ce n&apos;est presque jamais l&apos;exercice, c&apos;est le fait de le faire
              tous les jours.
            </p>
            <p className="text-forest-700 leading-relaxed mb-6">
              Respirfacile applique la même idée à la rééducation myofonctionnelle : le praticien prescrit, le patient
              pratique guidé chez lui, et les deux relisent les mêmes données à la séance suivante.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#2D5016]/10 flex items-center justify-center text-xl">🫁</div>
              <div>
                <div className="font-bold text-forest-800">Clément</div>
                <div className="text-sm text-forest-600">Fondateur, Annecy, France</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-beige-100 rounded-3xl p-8 border border-beige-300">
              <p className="font-bold text-forest-800 mb-5 text-lg">Où en est Respirfacile</p>
              <div className="space-y-4">
                {[
                  {
                    emoji: "🌱",
                    text: "L'application démarre. Vous ne verrez ni compteur d'utilisateurs ni note de satisfaction sur ce site tant que je n'aurai pas de chiffres réels à montrer.",
                  },
                  {
                    emoji: "📚",
                    text: "Les exercices s'appuient sur les protocoles myofonctionnels publiés, sources citées plus bas avec leurs limites.",
                  },
                  {
                    emoji: "🩺",
                    text: "Le cadrage clinique a été relu avec une orthophoniste qui suit des patients avec apnées du sommeil.",
                  },
                  {
                    emoji: "🇫🇷",
                    text: "Pensé pour l'exercice libéral français, orthophonistes et kinésithérapeutes.",
                  },
                  {
                    emoji: "🔒",
                    text: "Données hébergées en France, chiffrées en transit et au repos, cloisonnées patient par patient.",
                  },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                    <p className="text-forest-700 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
