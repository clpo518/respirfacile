import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Tarifs abonnement orthophoniste — 30 jours gratuits | Respirfacile",
  description:
    "Abonnement Respirfacile pour orthophonistes et kinésithérapeutes : Starter 15€/mois (5 patients), Pro 30€/mois (20 patients), Cabinet 55€/mois (illimité). 30 jours gratuits, sans carte bancaire.",
  openGraph: {
    title: "Tarifs Respirfacile — 30 jours offerts pour les orthophonistes",
    description:
      "Plans Starter, Pro et Cabinet. Suivi patients SAOS & TMOF, bilans PDF, historique, support. Essai gratuit 30 jours.",
    url: "https://respirfacile.fr/pricing",
  },
  alternates: { canonical: "https://respirfacile.fr/pricing" },
};

const plans = [
  {
    name: "Starter",
    price: 15,
    period: "/mois",
    description: "Pour commencer",
    highlighted: false,
    features: [
      "Jusqu'à 5 patients",
      "Tous les exercices",
      "Bilans PDF",
      "Historique 3 mois",
      "Support email",
    ],
    cta: "Démarrer l'essai gratuit",
  },
  {
    name: "Pro",
    price: 30,
    period: "/mois",
    description: "Recommandé",
    highlighted: true,
    features: [
      "Jusqu'à 20 patients",
      "Tous les exercices",
      "Bilans PDF avancés",
      "Historique 12 mois",
      "Support prioritaire",
      "Codes Pro illimités",
    ],
    cta: "Démarrer l'essai gratuit",
  },
  {
    name: "Cabinet",
    price: 55,
    period: "/mois",
    description: "Pour structures",
    highlighted: false,
    features: [
      "Patients illimités",
      "Tous les exercices",
      "Bilans PDF complets",
      "Historique illimité",
      "Support dédié",
      "Accès administrateur",
      "Rapports de cabinet",
    ],
    cta: "Démarrer l'essai gratuit",
  },
];

interface PricingPageProps {
  searchParams: Promise<{ expired?: string }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const isExpired = params.expired === "1";

  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Plans d'abonnement Respirfacile",
    "itemListElement": plans.map((plan, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Offer",
        "name": plan.name,
        "description": plan.features.join(", "),
        "price": plan.price,
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": plan.price,
          "priceCurrency": "EUR",
          "unitText": "MONTH",
        },
        "url": "https://respirfacile.fr/pricing",
      },
    })),
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <Navbar />
      <main className="w-full">
        {/* Expired Banner */}
        {isExpired && (
          <div className="bg-copper-500 text-white px-4 py-4 text-center">
            <p className="font-semibold">
              ⏰ Votre essai a expiré. Choisissez un plan pour continuer à accompagner vos patients.
            </p>
          </div>
        )}

        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-4">Tarification</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-forest-800 mb-6">
              Des prix simples et justes
            </h1>
            <p className="text-xl text-forest-600 leading-relaxed max-w-2xl mx-auto">
              30 jours gratuits, sans carte bancaire. Choisissez le plan qui correspond à vos besoins.
            </p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-100 border-b border-beige-300">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-4 text-sm text-forest-700">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-forest-500/20 border-2 border-beige-100 flex items-center justify-center text-xs font-bold text-forest-700"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="font-semibold">85 orthophonistes nous font confiance</span>
            </div>
            <p className="text-xs text-forest-500 mt-3">
              Vos patients accèdent complètement gratuitement via votre code Pro.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 flex flex-col ${
                    plan.highlighted
                      ? "bg-forest-800 text-beige-100 border-2 border-forest-600 shadow-lg ring-2 ring-forest-500/50"
                      : "bg-beige-100 border border-beige-300 shadow-beige"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="mb-4 inline-block">
                      <span className="inline-block bg-copper-500 text-beige-100 text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ Recommandé
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${plan.highlighted ? "text-copper-400" : "text-copper-500"}`}>
                      {plan.description}
                    </p>
                    <h3 className={`font-display text-2xl font-bold mb-2 ${plan.highlighted ? "text-beige-100" : "text-forest-800"}`}>
                      {plan.name}
                    </h3>
                    <div className={`text-4xl font-bold ${plan.highlighted ? "text-copper-400" : "text-forest-800"}`}>
                      {plan.price}€<span className={`text-lg ${plan.highlighted ? "text-beige-300" : "text-forest-600"}`}>{plan.period}</span>
                    </div>
                  </div>

                  <p className={`text-sm mb-6 ${plan.highlighted ? "text-beige-200" : "text-forest-600"}`}>
                    {plan.description === "Recommandé"
                    ? "Choix populaire auprès des orthos actives"
                    : plan.name === "Cabinet"
                    ? "Idéal pour un cabinet multi-praticiens"
                    : "Parfait pour démarrer"}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full ${plan.highlighted ? "bg-copper-400/15 border border-copper-400/30" : "bg-forest-500/15 border border-forest-500/30"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <svg className={`w-2.5 h-2.5 ${plan.highlighted ? "text-copper-400" : "text-forest-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm ${plan.highlighted ? "text-beige-200" : "text-forest-700"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/auth?mode=signup&role=therapist&plan=${plan.name.toLowerCase()}`}
                    className={`block w-full text-center rounded-full py-3.5 text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-copper-500 text-beige-100 hover:bg-copper-600 shadow-copper"
                        : "bg-forest-500 text-beige-100 hover:bg-forest-600"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <p className={`text-center text-xs mt-3 ${plan.highlighted ? "text-beige-300" : "text-forest-400"}`}>
                    30 jours gratuits · Sans CB
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-forest-800 text-center mb-10">
              Comparaison détaillée
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-beige-400">
                    <th className="text-left py-4 px-4 font-semibold text-forest-800">Fonctionnalité</th>
                    <th className="text-center py-4 px-4 font-semibold text-forest-800">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold text-forest-800">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold text-forest-800">Cabinet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-400">
                  <tr>
                    <td className="py-3 px-4 font-medium text-forest-800">Patients maximum</td>
                    <td className="text-center py-3 px-4 text-forest-700">5</td>
                    <td className="text-center py-3 px-4 text-forest-700 font-bold">20</td>
                    <td className="text-center py-3 px-4 text-forest-700">Illimité</td>
                  </tr>
                  <tr className="bg-beige-100/50">
                    <td className="py-3 px-4 font-medium text-forest-800">Tous les exercices</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-forest-800">Bilan PDF</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="bg-beige-100/50">
                    <td className="py-3 px-4 font-medium text-forest-800">Historique de progression</td>
                    <td className="text-center py-3 px-4 text-sm">3 mois</td>
                    <td className="text-center py-3 px-4 text-sm font-bold">12 mois</td>
                    <td className="text-center py-3 px-4 text-sm">Illimité</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-forest-800">Support</td>
                    <td className="text-center py-3 px-4 text-sm">Email</td>
                    <td className="text-center py-3 px-4 text-sm font-bold">Prioritaire</td>
                    <td className="text-center py-3 px-4 text-sm">Dédié</td>
                  </tr>
                  <tr className="bg-beige-100/50">
                    <td className="py-3 px-4 font-medium text-forest-800">Codes Pro illimités</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-forest-800 text-center mb-10">
              Questions fréquentes
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Mes patients doivent-ils payer ou télécharger quelque chose ?",
                  a: "Non et non. L'accès est entièrement gratuit pour eux, pas de carte bancaire, pas d'application à installer. Vous leur transmettez votre code Pro (email, SMS, ou à la consultation), ils s'inscrivent en 2 minutes depuis leur navigateur et peuvent commencer leurs exercices dans la foulée.",
                },
                {
                  q: "Puis-je tester avant de m'engager ?",
                  a: "Oui. 30 jours gratuits complets, sans carte bancaire à l'inscription. Vous créez votre espace, invitez vos premiers patients, prescrivez des programmes et voyez les résultats, avant de décider. La carte bancaire n'est demandée qu'à la fin du trial, si vous continuez.",
                },
                {
                  q: "Combien de temps faut-il pour mettre en place Respirfacile avec un patient ?",
                  a: "Moins de 5 minutes pour la mise en place : vous copiez votre code Pro, le transmettez au patient, il s'inscrit et vous le retrouvez dans votre tableau de bord. Prescrire un programme prend 2 minutes supplémentaires. Après ça, l'application fait le travail entre les séances.",
                },
                {
                  q: "Est-ce compatible avec les appareils CPAP et les orthèses ?",
                  a: "Oui. Respirfacile n'est pas concurrent de ces traitements, il les complète. La rééducation myofonctionnelle améliore le tonus des muscles oropharyngés, ce qui renforce l'efficacité des appareils existants. Plusieurs études montrent une réduction de l'IAH significative lorsque les deux approches sont combinées.",
                },
                {
                  q: "Y a-t-il un engagement de durée ?",
                  a: "Non. Mensuel, sans engagement minimum. Vous changez de plan ou annulez à la fin du mois courant, sans pénalité. Si vous annulez, les données de vos patients restent accessibles 60 jours, le temps de les exporter ou de les transférer si besoin.",
                },
                {
                  q: "Mes données et celles de mes patients sont-elles protégées ?",
                  a: "Oui. Hébergement en Europe, chiffrement en transit et au repos, accès strictement limité praticien/patient, conformité RGPD complète. Vos données ne sont jamais partagées avec des tiers ni utilisées à des fins commerciales. En cas d'audit, nous pouvons fournir notre documentation de conformité.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="group bg-beige-100 rounded-2xl border border-beige-300 overflow-hidden cursor-pointer">
                  <summary className="flex items-center justify-between p-5 font-medium text-forest-800 hover:bg-beige-200/50 transition-colors list-none">
                    {q}
                    <svg className="w-5 h-5 text-forest-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-forest-600 border-t border-beige-300 pt-4 leading-relaxed">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-forest-500 to-forest-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-beige-100 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-beige-200 mb-8 max-w-xl mx-auto">
              30 jours gratuits. Aucune carte bancaire requise. Annulable à tout moment.
            </p>
            <Link
              href="/auth?mode=signup&role=therapist"
              className="inline-flex items-center justify-center rounded-full bg-copper-500 hover:bg-copper-600 px-8 py-4 text-beige-100 font-semibold transition-colors text-lg shadow-copper"
            >
              Commencer l'essai gratuit 30 jours
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-xs text-beige-300 mt-4">
              Sans CB · Annulable · RGPD · France
            </p>
          </div>
        </section>

        {/* Contact fallback */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-forest-800 mb-4">
              Besoins spécifiques ?
            </h2>
            <p className="text-forest-600 mb-6 text-sm">
              Grand cabinet, structure hospitalière, ou questions sur intégration spéciale ?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-forest-500 px-8 py-3 text-forest-700 font-semibold hover:bg-forest-500 hover:text-beige-100 transition-colors text-sm"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
