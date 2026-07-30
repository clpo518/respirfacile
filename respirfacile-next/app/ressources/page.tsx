import Link from "next/link";
import { PatientNavbar } from "@/components/layout/PatientNavbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ et ressources",
  description:
    "Questions fréquentes sur les exercices de rééducation respiratoire : Pause Contrôlée, apnée du sommeil, SAOS, CPAP, TMOF. Conseils pratiques pour progresser en autonomie.",
  openGraph: {
    title: "FAQ exercices respiratoires",
    description:
      "Combien de temps avant de voir des résultats ? Peut-on pratiquer avec un CPAP ? Toutes les réponses sur la rééducation respiratoire.",
    url: "https://respirfacile.fr/ressources",
  },
  alternates: { canonical: "https://respirfacile.fr/ressources" },
};

const faqs = [
  {
    q: "Combien de temps avant de voir une différence ?",
    a: "La plupart des patients remarquent une amélioration du sommeil et une réduction du ronflement après 2 à 4 semaines de pratique quotidienne. Le score de Pause Contrôlée, lui, progresse souvent dès la première semaine, c'est votre premier indicateur concret.",
  },
  {
    q: "Je n'ai que 5 minutes par jour. Est-ce suffisant ?",
    a: "Oui. 5 minutes chaque jour valent bien mieux qu'une heure le week-end. Commencez par un seul exercice (la cohérence cardiaque ou la Pause Contrôlée), faites-le bien, et ajoutez-en un deuxième quand ça devient automatique. La régularité prime toujours sur la durée.",
  },
  {
    q: "Puis-je faire les exercices si j'ai un rhume ou le nez bouché ?",
    a: "Oui, mais adaptez. Si vous êtes très congestionné, évitez les exercices de rétention de souffle, ils peuvent être inconfortables. La cohérence cardiaque (respiration rythmée) et les exercices de bouche et de langue restent tout à fait adaptés.",
  },
  {
    q: "Je dors avec un appareil CPAP ou une orthèse. Dois-je quand même faire les exercices ?",
    a: "Oui, et c'est particulièrement recommandé dans votre cas. Les exercices renforcent les muscles des voies aériennes supérieures, langue, gorge, lèvres, ce qui améliore l'efficacité de votre appareil sur le long terme et peut permettre d'en réduire la pression progressivement. Votre praticien suit cette évolution.",
  },
  {
    q: "Une séance me rend fatigué(e). C'est normal ?",
    a: "Oui, surtout les premiers jours. C'est le signe que vos muscles travaillent, comme après une séance de sport pour un muscle peu sollicité. Réduisez à 5-10 minutes et augmentez progressivement. Si la fatigue persiste au-delà d'une semaine, signalez-le à votre praticien : il ajustera votre programme.",
  },
  {
    q: "Quel est le meilleur moment de la journée pour pratiquer ?",
    a: "Les exercices de langue et de respiration rythmée sont particulièrement efficaces le soir, 30 minutes avant le coucher, ils préparent les voies aériennes et facilitent l'endormissement. La Pause Contrôlée fonctionne mieux le matin ou en dehors des repas. En pratique : le meilleur moment est celui que vous tenez dans la durée.",
  },
  {
    q: "Puis-je pratiquer au travail ou dans les transports ?",
    a: "Tout à fait. La cohérence cardiaque et les exercices de langue sont invisibles, vous pouvez les faire assis à votre bureau, dans le train ou en salle d'attente. Personne ne remarque rien. Seule la Pause Contrôlée (qui implique de marcher en apnée) nécessite un peu d'espace.",
  },
  {
    q: "Y a-t-il des situations où il vaut mieux ne pas pratiquer ?",
    a: "Si vous avez de l'asthme sévère non contrôlé, des troubles cardiaques, ou si vous êtes enceinte, parlez-en d'abord à votre médecin avant de commencer les exercices de rétention de souffle. Les exercices de langue et de respiration rythmée restent généralement sans contre-indication. En cas de doute, demandez directement à votre praticien.",
  },
  {
    q: "Mon score de Pause Contrôlée varie d'un jour à l'autre. Est-ce que ça signifie que je régresse ?",
    a: "Non. La variation quotidienne est normale, le stress, la fatigue, un repas récent ou une légère maladie influencent le score. Ce qui compte, c'est la tendance sur 1 à 2 semaines. C'est pour ça que le graphique de progression affiche la courbe sur 30 jours, pas la valeur du jour.",
  },
];

const explainers = [
  {
    icon: "😴",
    title: "Pourquoi est-ce que je ronfle ou j'ai des apnées ?",
    content: "Pendant le sommeil, les muscles de la gorge perdent leur tonus et rétrécissent les voies respiratoires. L'air passe difficilement, c'est le ronflement. Quand il s'arrête complètement quelques secondes, c'est une apnée. Résultat : votre cerveau sort du sommeil profond pour relancer la respiration, des dizaines de fois par nuit parfois. D'où la fatigue au réveil, même après 8 heures.",
  },
  {
    icon: "👃",
    title: "Pourquoi est-ce si important de respirer par le nez ?",
    content: "Le nez filtre, réchauffe et humidifie l'air avant qu'il atteigne vos poumons. Il produit aussi de l'oxyde nitrique, une substance qui dilate naturellement les vaisseaux et améliore l'oxygénation. Respirer par la bouche, surtout la nuit, court-circuite tous ces mécanismes, assèche les voies respiratoires, et aggrave les troubles du sommeil. C'est souvent le premier réflexe à corriger.",
  },
  {
    icon: "🫁",
    title: "C'est quoi la Pause Contrôlée, et pourquoi on la mesure en pas ?",
    content: "La Pause Contrôlée mesure votre tolérance au CO₂ : vous expirez doucement, pincez le nez, puis vous marchez jusqu'au premier signal d'inconfort. Le nombre de pas, pas les secondes, est votre score. En marchant, vous consommez du CO₂ à un rythme constant, ce qui rend la mesure reproductible. Plus votre score monte, mieux votre corps tolère le CO₂, et mieux vous respirez même pendant le sommeil.",
  },
  {
    icon: "💪",
    title: "À quoi servent les exercices de langue et de gorge ?",
    content: "La langue, les lèvres, le palais mou et les muscles pharyngés peuvent être renforcés par l'exercice, exactement comme un muscle du bras. Des études montrent que des muscles oropharyngés plus toniques réduisent les ronflements et les apnées en maintenant les voies aériennes ouvertes pendant le sommeil. Votre praticien a sélectionné les exercices adaptés à votre profil, ce n'est pas du hasard.",
  },
];

export default function RessourcesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  };

  return (
    <main className="min-h-screen bg-beige-200 pb-24 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-forest-800 text-white px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Vos questions, nos réponses 📚</h1>
        <p className="text-white/80 max-w-xl mx-auto">Tout ce que vous devez savoir pour pratiquer avec confiance</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        <section>
          <h2 className="text-xl font-bold text-forest-800 mb-4">💡 Comprendre vos exercices</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {explainers.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-forest-800 mb-2">{item.title}</h3>
                <p className="text-sm text-forest-700 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#2D5016] rounded-3xl p-6 text-white text-center">
          <p className="text-lg font-semibold mb-2">Prêt à pratiquer ?</p>
          <p className="text-white/80 text-sm mb-4">Accédez à tous vos exercices guidés</p>
          <Link href="/exercises" className="inline-block bg-white text-[#2D5016] px-6 py-3 rounded-xl font-semibold hover:bg-[#F5F0E8] transition-colors">
            Voir mes exercices →
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-bold text-forest-800 mb-4">❓ Questions fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-2xl shadow-sm group">
                <summary className="p-5 font-medium text-forest-800 cursor-pointer flex items-center justify-between list-none">
                  {faq.q}
                  <span className="text-[#2D5016] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-forest-700 text-sm leading-relaxed border-t border-beige-200 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <p className="text-amber-800 font-medium">Une question spécifique à votre situation ?</p>
          <p className="text-amber-700 text-sm mt-1">Votre orthophoniste ou kiné est la meilleure personne pour y répondre.</p>
          <Link href="/dashboard" className="mt-3 inline-block text-[#2D5016] font-medium underline text-sm">
            Retour à mon tableau de bord
          </Link>
        </section>

      </div>
    </main>
  );
}
