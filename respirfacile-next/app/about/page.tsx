import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CLINICAL_STUDIES, EVIDENCE_DISCLAIMER } from "@/lib/content/evidence";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "L'histoire de Respirfacile",
  description:
    "Pourquoi j'ai créé Respirfacile : une application de rééducation myofonctionnelle pour que les patients pratiquent vraiment entre deux séances, et que leur orthophoniste ou leur kinésithérapeute le voie.",
  openGraph: {
    title: "L'histoire de Respirfacile",
    description:
      "Créée par le fondateur de parlermoinsvite.fr, pour combler le trou entre deux séances de rééducation.",
    url: absoluteUrl("/about"),
  },
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-4xl mx-auto">
            <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-4">L&apos;histoire</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-forest-800 mb-6 text-balance">
              Pourquoi j&apos;ai créé Respirfacile
            </h1>
            <p className="text-xl text-forest-600 leading-relaxed max-w-2xl">
              Une application pour que les exercices prescrits soient réellement faits entre deux séances, et que le
              praticien puisse le vérifier.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Le problème */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">Le problème</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-4">
                Le trou entre deux séances
              </h2>
              <p className="text-forest-600 leading-relaxed mb-4">
                La rééducation myofonctionnelle repose sur une pratique quotidienne, souvent trois mois durant. Le
                praticien voit son patient une fois par semaine au mieux. Entre les deux, il n&apos;a aucune visibilité :
                ni sur ce qui a été fait, ni sur la façon dont ça a été fait.
              </p>
              <p className="text-forest-600 leading-relaxed">
                Les feuilles d&apos;exercices imprimées finissent au fond d&apos;un tiroir. Les applications généralistes
                de respiration ne connaissent ni le protocole, ni le praticien, ni le profil du patient. Il manquait un
                outil français, pensé pour l&apos;exercice libéral, où le praticien prescrit et le patient exécute.
              </p>
            </div>

            {/* La réponse */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">La réponse</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-4">
                Le même pari que pour la parole
              </h2>
              <p className="text-forest-600 leading-relaxed mb-4">
                Je m&apos;appelle Clément. J&apos;ai créé parlermoinsvite.fr, une application de rééducation du débit de
                parole utilisée par des orthophonistes et leurs patients. J&apos;y ai appris que le facteur limitant
                n&apos;est presque jamais la qualité de l&apos;exercice, mais la régularité de sa pratique.
              </p>
              <p className="text-forest-600 leading-relaxed mb-4">
                Respirfacile reprend cette infrastructure et l&apos;applique aux voies aériennes supérieures : le
                praticien compose un programme, le patient le suit guidé depuis son téléphone, et les deux relisent les
                mêmes données à la séance suivante. Le cadrage clinique a été relu avec une orthophoniste qui suit des
                patients avec apnées du sommeil.
              </p>
              <p className="text-forest-600 leading-relaxed">
                L&apos;essai dure 30 jours, sans carte bancaire, résiliable à tout moment. Le patient, lui, ne paie
                jamais rien.
              </p>
            </div>

            {/* La science */}
            <div>
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">La science</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-2">
                Trois références, avec leurs limites
              </h2>
              <p className="text-forest-600 mb-6 max-w-2xl">
                Ces travaux portent sur la thérapie myofonctionnelle en général, pas sur Respirfacile.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CLINICAL_STUDIES.map((study) => (
                  <article key={study.id} className="rounded-3xl bg-forest-800 p-6 flex flex-col">
                    <p className="text-copper-400 text-xs font-semibold uppercase tracking-widest mb-3">
                      {study.shortRef}
                    </p>
                    <p className="text-beige-100 text-sm leading-relaxed flex-1 mb-3">{study.finding}</p>
                    <p className="text-forest-300 text-xs leading-relaxed">{study.design}</p>
                    <p className="text-forest-400 text-xs leading-relaxed mt-2">Limite : {study.caveat}</p>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-beige-200 text-xs font-medium hover:text-copper-300 transition-colors underline underline-offset-2 mt-3"
                    >
                      Référence complète
                    </a>
                  </article>
                ))}
              </div>
            </div>

            {/* Qui je suis */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">Qui je suis</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-6">
                Un développeur seul, pas une équipe
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-forest-800 mb-1">Clément</p>
                  <p className="text-sm text-forest-600">
                    Fondateur, Annecy. Créateur de parlermoinsvite.fr, application de rééducation du débit de parole. Je
                    conçois, je développe et je réponds aux messages moi-même. Si vous m&apos;écrivez, c&apos;est moi
                    qui vous répondrai.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-forest-800 mb-1">Relecture clinique</p>
                  <p className="text-sm text-forest-600">
                    Le catalogue d&apos;exercices et les garde-fous de sécurité ont été relus avec une orthophoniste
                    exerçant auprès de patients avec troubles respiratoires du sommeil. Elle n&apos;est ni associée ni
                    rémunérée sur le produit.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-forest-500 to-forest-600 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="font-display text-3xl font-bold text-beige-100 mb-4">
                Prêt à essayer ?
              </h2>
              <p className="text-beige-100 mb-6 max-w-xl mx-auto">
                30 jours d&apos;essai gratuit, sans carte bancaire. Accès immédiat pour vous et pour vos patients.
              </p>
              <Link
                href="/auth?mode=signup&role=therapist"
                className="inline-block rounded-full bg-copper-500 px-8 py-3 font-semibold text-beige-100 hover:bg-copper-600 transition-colors"
              >
                Démarrer l&apos;essai gratuit →
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="rounded-3xl bg-copper-500/10 border border-copper-500/20 p-6">
              <p className="text-sm text-copper-800">
                <strong>Avertissement médical :</strong> {EVIDENCE_DISCLAIMER} Les exercices de Pause Contrôlée doivent
                être encadrés par un praticien en cas de syndrome d&apos;apnées obstructives du sommeil sévère.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
