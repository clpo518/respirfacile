export function FounderSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#8B4513] mb-5">Le fondateur</p>
            <h2 className="text-4xl font-bold text-forest-800 mb-5 leading-tight">
              Né d&apos;une frustration<br/>d&apos;orthophoniste.
            </h2>
            <p className="text-forest-700 leading-relaxed mb-5 text-lg">
              Je m&apos;appelle Clément. J&apos;ai fondé <strong>parlermoinsvite.fr</strong>, une app de rééducation de la fluence utilisée par 120+ patients et leurs orthophonistes. J&apos;ai mesuré ce que le suivi numérique change vraiment.
            </p>
            <p className="text-forest-700 leading-relaxed mb-6">
              Respirfacile est né d&apos;une conversation avec <strong>Mathilde</strong>, orthophoniste spécialisée SAOS :
              <em className="block mt-3 pl-4 border-l-4 border-[#2D5016]/30 text-forest-800 not-italic font-medium">
                &ldquo;Mes patients oublient de pratiquer entre les séances. Si seulement ils avaient un outil guidé au quotidien, les résultats seraient bien meilleurs.&rdquo;
              </em>
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#2D5016]/10 flex items-center justify-center text-xl">🫁</div>
              <div>
                <div className="font-bold text-forest-800">Clément Pontegnier</div>
                <div className="text-sm text-forest-600">Fondateur, Annecy, France</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-beige-100 rounded-3xl p-8 border border-beige-300">
              <p className="font-bold text-forest-800 mb-5 text-lg">Construit sur des bases solides</p>
              <div className="space-y-4">
                {[
                  { emoji: "📚", text: "Basé sur Guimarães 2009, Camacho 2015, Puhan 2006, Cochrane 2020" },
                  { emoji: "🏥", text: "Validé avec des orthophonistes cliniciennes spécialisées SAOS" },
                  { emoji: "🔬", text: "Protocoles myofonctionnels éprouvés, sans jargon inaccessible" },
                  { emoji: "🇫🇷", text: "Conçu pour le marché français, RPPS orthos et kinés" },
                  { emoji: "🔒", text: "RGPD, hébergement Europe, secret médical respecté" },
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
