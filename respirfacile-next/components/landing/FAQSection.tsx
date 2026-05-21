"use client"
import { useState } from "react"

const FAQS = [
  {
    q: "À qui s'adresse Respirfacile ?",
    a: "Aux patients suivis par un orthophoniste ou un kinésithérapeute pour des troubles respiratoires du sommeil (ronflements, apnées légères à modérées, respiration buccale, SAOS). L'accès se fait via le praticien, c'est lui qui vous donne votre code d'entrée.",
  },
  {
    q: "Est-ce que ça marche vraiment ?",
    a: "Oui, à condition d'être régulier. Des études cliniques montrent qu'une rééducation myofonctionnelle réduit les apnées du sommeil de 50 % en moyenne sur les formes légères à modérées. Respirfacile est conçu pour que vous ne décrochiez pas, c'est là que tout se joue.",
  },
  {
    q: "Combien de temps par jour ?",
    a: "15 minutes suffisent. Ni plus, ni moins. Au-delà, les bénéfices plafonnent et la fatigue musculaire peut s'installer. L'application vous guide, chronomètre et s'arrête au bon moment.",
  },
  {
    q: "Je dois payer quelque chose ?",
    a: "Non. L'accès est entièrement gratuit pour le patient. C'est votre praticien qui souscrit l'abonnement pour son cabinet. Vous n'entrez jamais votre carte bancaire.",
  },
  {
    q: "Ça remplace mon traitement actuel (CPAP, orthèse) ?",
    a: "Non, et ce n'est pas l'objectif. Les exercices sont un complément thérapeutique prescrit par votre praticien. Ils renforcent les muscles des voies aériennes supérieures, ce qui améliore l'efficacité des traitements existants sur le long terme.",
  },
  {
    q: "Mes données médicales sont-elles protégées ?",
    a: "Oui. Hébergement en Europe, chiffrement de bout en bout, accès strictement limité à vous et à votre praticien. Conformité RGPD complète. Vos données ne sont jamais vendues ni utilisées à des fins commerciales.",
  },
  {
    q: "Et si mon praticien arrête l'abonnement ?",
    a: "Vos données restent accessibles pendant 60 jours après la fin de l'abonnement. Aucune donnée n'est supprimée immédiatement, vous avez le temps d'en faire une copie si besoin.",
  },
  {
    q: "Je suis praticien, mes patients doivent télécharger une application ?",
    a: "Non. Respirfacile est une application web : vos patients y accèdent depuis n'importe quel navigateur, sans installation. Vous générez un code Pro en 30 secondes, vous le transmettez, et ils sont opérationnels dès leur première connexion.",
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-beige-200" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/10 border border-forest-500/20 px-4 py-2 text-sm font-medium text-forest-700 mb-5">
            Questions
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-800 mb-4 text-balance">
            Tout ce que vous voulez savoir
          </h2>
          <p className="text-forest-500 max-w-xl mx-auto">
            Des questions ? Normal. Voici les réponses directes.
          </p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                open === i
                  ? "bg-beige-100 border-forest-300 shadow-sm"
                  : "bg-beige-100/60 border-beige-300 hover:border-forest-200 hover:bg-beige-100"
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-semibold text-sm md:text-base transition-colors ${open === i ? "text-forest-800" : "text-forest-700"}`}>
                  {faq.q}
                </span>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  open === i ? "bg-forest-500 rotate-45" : "bg-forest-500/10 border border-forest-500/20"
                }`}>
                  <svg className={`w-3.5 h-3.5 transition-colors ${open === i ? "text-beige-100" : "text-forest-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                  </svg>
                </div>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <div className="h-px bg-forest-500/10 mb-4" />
                  <p className="text-forest-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-forest-500">
            Une autre question ?{" "}
            <a href="mailto:contact@respirfacile.fr" className="text-forest-700 font-semibold hover:underline underline-offset-2">
              Écrivez-nous
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
