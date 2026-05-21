import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Notre histoire | Respirfacile",
  description:
    "L'histoire de Respirfacile : comment Clément, ancien patient bredouilleur, a créé l'application que les orthophonistes attendaient pour suivre leurs patients en thérapie myofonctionnelle orofaciale.",
  openGraph: {
    title: "Notre histoire | Respirfacile",
    description:
      "Créé par un ancien patient, conçu avec des orthophonistes. L'app de rééducation respiratoire qui met la science à portée de tous.",
    url: "https://respirfacile.fr/about",
  },
  alternates: { canonical: "https://respirfacile.fr/about" },
};

export default function AboutPage() {
  const studies = [
    {
      authors: "Camacho et al.",
      year: "2015",
      journal: "Sleep Medicine Reviews",
      title: "Efficacite de la OMT sur l'IAH",
      result: "-50% d'IAH en moyenne",
      details: "Meta-analyse de 9 etudes randomisees controlees, n=120 adultes",
    },
    {
      authors: "Guimaraes et al.",
      year: "2009",
      journal: "Sleep",
      title: "Exercices OMT et ronflement",
      result: "-39% d'IAH, -36 dB",
      details: "3 mois d'exercices d'OMT, n=31 patients",
    },
    {
      authors: "Lehrer & Gevirtz",
      year: "2014",
      journal: "Frontiers in Psychology",
      title: "Coherence cardiaque et sommeil",
      result: "Amelioration VFC et qualite",
      details: "Meta-analyse sur la variabilite de la frequence cardiaque",
    },
  ];

  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-4xl mx-auto">
            <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-4">Notre histoire</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-forest-800 mb-6 text-balance">
              L'histoire derriere Respirfacile
            </h1>
            <p className="text-xl text-forest-600 leading-relaxed max-w-2xl">
              Comment nous avons cree l'outil numerique que les orthophonistes attendaient pour suivre leurs patients entre les seances.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Le probleme */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">Le probleme</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-4">
                Un marche inexploite en France
              </h2>
              <p className="text-forest-600 leading-relaxed mb-4">
                En France, 4 a 6% de la population souffre d'apnee obstructive du sommeil (SAOS). La therapie myofonctionnelle orofaciale (TMOF) est validee scientifiquement : la meta-analyse Camacho 2015 montre une reduction de 50% de l'indice d'apnee-hypopnee (IAH) en moyenne.
              </p>
              <p className="text-forest-600 leading-relaxed">
                Et pourtant : aucun outil numerique francais serieux n'existait pour que les orthophonistes et kinesitherapeutes suivent leurs patients entre les seances. Les applications existantes etaient soit generalistes, soit americaines, sans adaptation au contexte francais ni au modele B2B (abonnement ortho, acces patient gratuit via code).
              </p>
            </div>

            {/* Notre reponse */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">Notre reponse</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-4">
                Nee d'une rencontre terrain
              </h2>
              <p className="text-forest-600 leading-relaxed mb-4">
                Respirfacile est nee de la rencontre entre Clement, fondateur de parlermoinsvite.fr (app de fluence de la parole depuis 2021), et Mathilde, orthophoniste specialisee en TMOF a Grenoble.
              </p>
              <p className="text-forest-600 leading-relaxed mb-4">
                L'idee : adapter l'infrastructure technique et la structure commerciale eprouvee de parlermoinsvite.fr pour creer l'outil que les orthos attendaient. Meme stack Supabase, meme architecture B2B, meme respect des donnees sensibles - mais un nouveau catalogue d'exercices, valide cliniquement, specifique a la respiration et aux voies aeriennes superieures.
              </p>
              <p className="text-forest-600 leading-relaxed">
                Resultat : une plateforme francaise, conforme RGPD, construite avec les praticiens pour les praticiens. Pas de prise de risque pour l'ortho - essai 30 jours gratuit, sans carte bancaire, annulation a tout moment.
              </p>
            </div>

            {/* La science */}
            <div>
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">La science</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-6">
                Trois etudes cles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studies.map((study, idx) => (
                  <div key={idx} className="rounded-3xl bg-forest-800 p-6 flex flex-col">
                    <p className="text-copper-400 text-xs font-semibold uppercase tracking-widest mb-3">
                      {study.authors} {study.year}
                    </p>
                    <h3 className="font-semibold text-beige-100 text-sm mb-2 flex-1">
                      {study.title}
                    </h3>
                    <p className="text-beige-100 font-bold mb-2">{study.result}</p>
                    <p className="text-forest-300 text-xs leading-relaxed">
                      {study.journal}
                    </p>
                    <p className="text-forest-400 text-xs leading-relaxed mt-2">
                      {study.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* L'equipe */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <p className="text-copper-500 text-xs font-semibold uppercase tracking-widest mb-4">L'equipe</p>
              <h2 className="font-display text-2xl font-bold text-forest-800 mb-6">
                Qui nous sommes
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-forest-800 mb-1">Clement Pontegnier</p>
                  <p className="text-sm text-forest-600">
                    Fondateur, Annecy. Createur de parlermoinsvite.fr (2021), app de fluence de la parole ayant 500+ orthos actifs. Passionne par les outils numeriques appliques a la sante et l'accessibilite.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-forest-800 mb-1">Mathilde (co-conceptrice)</p>
                  <p className="text-sm text-forest-600">
                    Orthophoniste specialisee en TMOF, Grenoble. Feedback terrain, validation des exercices, design du parcours patient. Apporte 10 ans d'experience clinique a la plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-forest-500 to-forest-600 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="font-display text-3xl font-bold text-beige-100 mb-4">
                Pret a essayer ?
              </h2>
              <p className="text-beige-100 mb-6 max-w-xl mx-auto">
                30 jours d'essai gratuit, sans carte bancaire. Acces immediat pour vous et vos patients.
              </p>
              <Link
                href="/auth?mode=signup&role=therapist"
                className="inline-block rounded-full bg-copper-500 px-8 py-3 font-semibold text-beige-100 hover:bg-copper-600 transition-colors"
              >
                Demarrer l'essai gratuit -&gt;
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="rounded-3xl bg-copper-500/10 border border-copper-500/20 p-6">
              <p className="text-sm text-copper-800">
                <strong>Avertissement medical :</strong> Respirfacile est un complement de traitement, pas un substitut au diagnostic et au traitement medical du SAOS. Consultez toujours votre medecin et votre orthophoniste. Les exercices de Pause Controlee doivent etre supervises par un praticien en cas de SAOS severe.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
