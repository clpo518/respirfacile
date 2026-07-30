import { contactEmail } from "@/lib/site";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Source unique des questions fréquentes.
 * Alimente à la fois la section visible de la landing et le JSON-LD FAQPage :
 * Google pénalise un balisage FAQ qui ne correspond pas au texte affiché, donc
 * les deux doivent venir d'ici. Ne jamais dupliquer ce tableau.
 */
export const FAQS: FaqItem[] = [
  {
    q: "À qui s'adresse Respirfacile ?",
    a: "Aux patients suivis par un orthophoniste ou un kinésithérapeute pour des troubles respiratoires du sommeil : ronflements, apnées légères à modérées, respiration buccale, syndrome d'apnées obstructives du sommeil. L'accès se fait via le praticien, c'est lui qui vous donne votre code d'entrée.",
  },
  {
    q: "Est-ce que ça marche vraiment ?",
    a: "La thérapie myofonctionnelle a été étudiée : une méta-analyse de 2015 rapporte une baisse d'environ 50 % de l'indice d'apnées-hypopnées sur des formes légères à modérées, et la revue Cochrane de 2020 conclut à un effet probable sur la somnolence diurne avec un niveau de preuve modéré à très faible. Ces chiffres viennent des études, pas de Respirfacile. Ce que l'application apporte, c'est la régularité, et c'est précisément là que la plupart des programmes échouent.",
  },
  {
    q: "Combien de temps par jour ?",
    a: "Comptez 15 minutes dans l'application. Les protocoles publiés vont de 10 à 30 minutes par jour sur environ 3 mois. C'est votre praticien qui fixe le bon volume selon votre profil, l'application ne le décide pas à sa place.",
  },
  {
    q: "Je dois payer quelque chose ?",
    a: "Non. L'accès est entièrement gratuit pour le patient. C'est votre praticien qui souscrit l'abonnement pour son cabinet. Vous n'entrez jamais votre carte bancaire.",
  },
  {
    q: "Ça remplace mon traitement actuel, pression positive continue ou orthèse ?",
    a: "Non, et ce n'est pas l'objectif. La revue Cochrane est claire sur ce point : face à la pression positive continue, la rééducation myofonctionnelle fait moins bien. Les exercices sont un complément prescrit par votre praticien, jamais un remplacement. Aucune modification de votre traitement ne doit être décidée sans votre médecin.",
  },
  {
    q: "Mes données médicales sont-elles protégées ?",
    a: "Les données sont hébergées en France, chiffrées en transit et au repos, et cloisonnées au niveau de la base : chaque patient ne peut lire que ses propres données, chaque praticien uniquement celles des patients qui lui sont rattachés. Vos données ne sont ni vendues ni utilisées à des fins publicitaires.",
  },
  {
    q: "Et si mon praticien arrête l'abonnement ?",
    a: `Vos données ne sont pas supprimées automatiquement. Vous pouvez à tout moment demander leur export ou leur suppression en écrivant à ${contactEmail}.`,
  },
  {
    q: "Je suis praticien, mes patients doivent télécharger une application ?",
    a: "Non. Respirfacile est une application web : vos patients y accèdent depuis n'importe quel navigateur, sans installation. Vous générez un code d'accès, vous le transmettez, ils sont opérationnels dès leur première connexion.",
  },
];

/** Balisage schema.org FAQPage construit depuis la même source que l'affichage. */
export function faqJsonLd() {
  return {
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
