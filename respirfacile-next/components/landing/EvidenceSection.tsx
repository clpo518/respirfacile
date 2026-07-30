import { CLINICAL_STUDIES, EVIDENCE_DISCLAIMER, PRODUCT_PROMISE } from "@/lib/content/evidence";

/**
 * Remplace l'ancien module de témoignages, qui affichait des avis et des
 * statistiques d'usage inventés (85 professionnels, 4,8/5 sur 120 utilisateurs).
 * Un orthophoniste vérifie ses sources : les vraies références sont un
 * argument plus solide qu'un faux avis, et elles n'exposent pas à une
 * qualification de pratique commerciale trompeuse sur un produit de santé.
 */
export function EvidenceSection() {
  return (
    <section id="preuves" className="py-24 px-4 sm:px-6 lg:px-8 bg-forest-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-copper-500/20 border border-copper-500/30 px-4 py-2 text-sm font-medium text-copper-300 mb-5">
            Littérature
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-beige-100 mb-4 text-balance">
            Sur quoi repose la méthode
          </h2>
          <p className="text-beige-300 max-w-2xl mx-auto">
            Trois références, avec leurs limites. Vous jugez sur pièces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {CLINICAL_STUDIES.map((study) => (
            <article
              key={study.id}
              className="bg-forest-700/50 border border-forest-600/50 rounded-3xl p-7 flex flex-col gap-4"
            >
              <div>
                <p className="font-semibold text-beige-100 text-sm">{study.shortRef}</p>
                <p className="text-forest-300 text-xs mt-1">{study.design}</p>
              </div>
              <p className="text-forest-100 text-sm leading-relaxed flex-1">{study.finding}</p>
              <div className="border-t border-forest-600/30 pt-4">
                <p className="text-copper-300 text-xs font-medium mb-1">Ce que l&apos;étude ne dit pas</p>
                <p className="text-forest-300 text-xs leading-relaxed">{study.caveat}</p>
              </div>
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-beige-200 text-xs font-medium hover:text-copper-300 transition-colors underline underline-offset-2"
              >
                Lire la référence sur PubMed
              </a>
            </article>
          ))}
        </div>

        <div className="bg-forest-700/30 border border-forest-600/30 rounded-3xl p-8">
          <p className="text-beige-100 font-semibold mb-3">Ce que Respirfacile ne prétend pas être</p>
          <p className="text-forest-200 text-sm leading-relaxed mb-4">{EVIDENCE_DISCLAIMER}</p>
          <p className="text-beige-200 text-sm leading-relaxed">{PRODUCT_PROMISE}</p>
        </div>
      </div>
    </section>
  );
}
