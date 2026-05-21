import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog — rééducation respiratoire et apnée du sommeil | Respirfacile",
  description:
    "Articles scientifiques et guides pratiques sur la rééducation respiratoire, l'apnée du sommeil (SAOS), la thérapie myofonctionnelle orofaciale. Références cliniques validées.",
  openGraph: {
    title: "Blog Respirfacile — Science, SAOS et thérapie myofonctionnelle",
    description:
      "Études cliniques, protocoles et conseils pratiques pour orthophonistes et patients. IAH, Pause Contrôlée, exercices oropharyngés.",
    url: "https://respirfacile.fr/blog",
  },
  alternates: { canonical: "https://respirfacile.fr/blog" },
};

const articles = [
  {
    slug: "therapie-myofonctionnelle-apnee-sommeil",
    title: "La thérapie myofonctionnelle réduit l'IAH de 50%, ce que dit la science",
    excerpt: "La méta-analyse Camacho et al. 2015 (Stanford, n=120) est la référence mondiale. Voici ce qu'elle démontre et comment Respirfacile l'applique.",
    date: "Avril 2026",
    readTime: "5 min",
    tag: "Science",
  },
  {
    slug: "exercices-respiration-nasale",
    title: "Respiration nasale : pourquoi c'est la base de tout traitement SAOS",
    excerpt: "80% des patients SAOS respirent par la bouche la nuit. La rééducation nasale est le premier levier thérapeutique, voici comment le travailler.",
    date: "Avril 2026",
    readTime: "4 min",
    tag: "Exercices",
  },
  {
    slug: "pause-controlee-mesurer-progres",
    title: "Pause Contrôlée : comment mesurer vos progrès semaine après semaine",
    excerpt: "Le test de la Pause Contrôlée (score en nombre de pas) est le marqueur clé de progression. Comprendre votre score et ce qu'il signifie.",
    date: "Mars 2026",
    readTime: "6 min",
    tag: "Protocole",
  },
];

export default function BlogPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-4xl mx-auto">
            <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-4">Blog</p>
            <h1 className="font-display text-5xl font-bold text-forest-800 mb-4">
              Ressources
            </h1>
            <p className="text-lg text-forest-600">
              Science, protocoles et conseils pratiques sur la rééducation respiratoire.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-4xl mx-auto space-y-4">
            {articles.map((article) => (
              <div key={article.slug} className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8 hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-copper-500 bg-copper-500/10 border border-copper-500/20 rounded-full px-3 py-1">
                    {article.tag}
                  </span>
                  <span className="text-xs text-forest-400">{article.date} · {article.readTime} de lecture</span>
                </div>
                <h2 className="font-display text-xl font-bold text-forest-800 mb-3 leading-snug">
                  {article.title}
                </h2>
                <p className="text-forest-600 text-sm leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <span className="text-sm font-semibold text-forest-500 inline-flex items-center gap-1">
                  Bientôt disponible
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-forest-800 mb-3">
              Restez informé
            </h2>
            <p className="text-forest-600 text-sm mb-6">
              Nouveaux articles, mises à jour protocoles, ressources orthos, directement dans votre boîte.
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
      <Footer />
    </div>
  );
}
