/**
 * Normes d'étalonnage officielles — Batterie d'Évaluation du Bredouillement
 * Van Zaalen, Aumont Boucand, Brejon, Desportes, Meyer (2018)
 * N = 61 sujets contrôles (population 18-60 ans)
 */

export interface NormValue {
  label: string;
  mean: number;
  sd: number;
  upperBound2SD: number | null; // borne supérieure issue de l'étalonnage original
  lowerBound2SD: number | null; // borne inférieure (null si non cliniquement pertinent)
  unit?: string;
  direction?: 'lower_is_worse' | 'higher_is_worse'; // which direction is pathological
}

export interface TaskNorms {
  taskName: string;
  variables: NormValue[];
}

// ====== PAROLE SPONTANÉE ======
export const SPONTANEOUS_SPEECH_NORMS: TaskNorms = {
  taskName: "Parole spontanée",
  variables: [
    { label: "Vitesse articulatoire", mean: 5.58, sd: 0.61, upperBound2SD: 6.34, lowerBound2SD: null, unit: "syll/s" },
    { label: "Variabilité de la vitesse articulatoire", mean: 2.68, sd: 1.11, upperBound2SD: 4.07, lowerBound2SD: null, unit: "syll/s", direction: "higher_is_worse" },
    { label: "Disfluences normales", mean: 16.31, sd: 7.00, upperBound2SD: 25.06, lowerBound2SD: null, unit: "/200 syll", direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Disfluences bègues", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs syntaxiques", mean: 0.08, sd: 0.28, upperBound2SD: 0.43, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

// ====== PCI (Predictive Cluttering Inventory) ======
export const PCI_NORMS: TaskNorms = {
  taskName: "Test prédictif (PCI)",
  variables: [
    { label: "Score total", mean: 1.33, sd: 1.71, upperBound2SD: 3.47, lowerBound2SD: null, unit: "/50", direction: "higher_is_worse" },
  ]
};

// Seuil officiel du test prédictif
export const PCI_THRESHOLD = 24;

// ====== OMAS ======
export const OMAS_NORMS: TaskNorms = {
  taskName: "Évaluation motrice (OMAS)",
  variables: [
    { label: "Vitesse /pa/", mean: 3.89, sd: 1.42, upperBound2SD: 5.68, lowerBound2SD: null, unit: "syll/s" },
    { label: "Vitesse /taka/", mean: 6.13, sd: 1.12, upperBound2SD: 7.55, lowerBound2SD: null, unit: "syll/s" },
    { label: "Vitesse /pataka/", mean: 6.79, sd: 1.00, upperBound2SD: 8.07, lowerBound2SD: null, unit: "syll/s" },
  ]
};

// ====== ENCODAGE PHONOLOGIQUE (SPA) ======
export const SPA_NORMS: TaskNorms = {
  taskName: "Encodage phonologique (SPA)",
  variables: [
    { label: "Erreurs de précision", mean: 1.72, sd: 1.21, upperBound2SD: 3.24, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs de voisement", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs de flux", mean: 0.18, sd: 0.39, upperBound2SD: 0.67, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs de séquentialisation", mean: 0.23, sd: 0.50, upperBound2SD: 0.85, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs de débit", mean: 0.05, sd: 0.28, upperBound2SD: null, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

// Items SPA officiels
export const SPA_ITEMS = [
  "Gentillesse et malice",
  "Difficulté",
  "Anticonstitutionnellement",
  "Recevoir une augmentation de salaire",
  "Probabilité possible",
  "Respecter davantage le temps",
  "Complication peu pratique",
  "Formidable découverte de la ville",
  "Incroyable construction extractible",
  "Mettons le haut parleur",
];

// Colonnes d'erreurs SPA
export const SPA_ERROR_TYPES = [
  { key: "precision", label: "Précision" },
  { key: "voisement", label: "Voisement" },
  { key: "flux", label: "Flux" },
  { key: "sequentialisation", label: "Séquentialisation" },
  { key: "debit", label: "Débit" },
] as const;

// ====== REFORMULATION D'HISTOIRE ======
export const RETELLING_NORMS: TaskNorms = {
  taskName: "Reformulation d'histoire",
  variables: [
    { label: "Vitesse articulatoire", mean: 5.56, sd: 0.69, upperBound2SD: 6.43, lowerBound2SD: null, unit: "syll/s" },
    { label: "Variabilité de la vitesse articulatoire", mean: 3.05, sd: 1.15, upperBound2SD: 4.49, lowerBound2SD: null, unit: "syll/s", direction: "higher_is_worse" },
    { label: "Disfluences normales", mean: 5.79, sd: 3.72, upperBound2SD: 10.44, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Disfluences bègues", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs syntaxiques", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Items principaux rappelés", mean: 7.85, sd: 2.40, upperBound2SD: null, lowerBound2SD: 4.85, unit: "/13", direction: "lower_is_worse" },
    { label: "Items secondaires rappelés", mean: 3.15, sd: 2.07, upperBound2SD: null, lowerBound2SD: 0.56, unit: "/9", direction: "lower_is_worse" },
    { label: "Additions", mean: 4.36, sd: 2.63, upperBound2SD: 7.65, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

// Items du porte-monnaie — principaux (13) et secondaires (9)
export const RETELLING_MAIN_ITEMS = [
  { index: 1, text: "C'était un jour pluvieux de novembre", accepted: "jour de pluie, mauvais temps, automne" },
  { index: 2, text: "Une femme allait au supermarché avec sa voiture flambant neuve", accepted: "magasin, courses, nouvelle voiture" },
  { index: 3, text: "Elle avait invité trois copines à dîner le soir", accepted: "amies, repas du soir" },
  { index: 4, text: "Alors qu'elle faisait ses courses", accepted: "pendant qu'elle achetait, au milieu des courses" },
  { index: 5, text: "Son porte-monnaie tomba de son sac", accepted: "portefeuille, sac à main" },
  { index: 6, text: "Sans qu'elle ne s'en aperçoive", accepted: "sans le remarquer, sans voir" },
  { index: 7, text: "Quand elle arriva à la caisse, elle ne put pas payer ses courses", accepted: "au moment de payer, impossible de régler" },
  { index: 8, text: "Et rentra chez elle", accepted: "retourna à la maison, repartit" },
  { index: 9, text: "Alors qu'elle ouvrait tout juste la porte de sa maison", accepted: "en arrivant chez elle, devant sa porte" },
  { index: 10, text: "Le téléphone sonna", accepted: "quelqu'un appela, coup de fil" },
  { index: 11, text: "Un petit garçon lui annonça", accepted: "un enfant, un gamin" },
  { index: 12, text: "Qu'il avait trouvé son porte-monnaie", accepted: "retrouvé son portefeuille" },
  { index: 13, text: "Voilà l'histoire", accepted: "fin de l'histoire, c'est tout" },
];

export const RETELLING_SECONDARY_ITEMS = [
  { index: 1, text: "Et leur avait promis de préparer un repas italien", accepted: "cuisine italienne, dîner italien" },
  { index: 2, text: "Sa spécialité", accepted: "son plat favori, ce qu'elle fait le mieux" },
  { index: 3, text: "Son caddie était déjà plein", accepted: "chariot rempli, plein de courses" },
  { index: 4, text: "Le caissier accepta de surveiller son caddie un moment", accepted: "garder son chariot, attendre" },
  { index: 5, text: "La femme mit ses courses de côté", accepted: "laissa ses courses, abandonna son caddie" },
  { index: 6, text: "Les essuie-glaces marchaient dans tous les sens", accepted: "il pleuvait fort, essuie-glaces à fond" },
  { index: 7, text: "Tous les feux de signalisation étaient bien évidemment rouges", accepted: "feux rouges, circulation difficile" },
  { index: 8, text: "Elle était terriblement excédée", accepted: "énervée, frustrée, agacée, en colère" },
  { index: 9, text: "La dame fut très soulagée", accepted: "rassurée, contente, heureuse" },
];

// L'histoire complète à lire au patient
export const RETELLING_STORY_TEXT = `C'était un jour pluvieux de novembre. Une femme allait au supermarché avec sa voiture flambant neuve. Elle avait invité trois copines à dîner le soir et leur avait promis de préparer un repas italien, sa spécialité. Alors qu'elle faisait ses courses, son porte-monnaie tomba de son sac sans qu'elle ne s'en aperçoive. Son caddie était déjà plein. Quand elle arriva à la caisse, elle ne put pas payer ses courses. Le caissier accepta de surveiller son caddie un moment. La femme mit ses courses de côté et rentra chez elle. Les essuie-glaces marchaient dans tous les sens. Tous les feux de signalisation étaient bien évidemment rouges. Elle était terriblement excédée. Alors qu'elle ouvrait tout juste la porte de sa maison, le téléphone sonna, un petit garçon lui annonça qu'il avait trouvé son porte-monnaie. La dame fut très soulagée. Voilà l'histoire.`;

// ====== LECTURE À VOIX HAUTE ======
export const READING_NORMS: TaskNorms = {
  taskName: "Lecture à voix haute",
  variables: [
    { label: "Vitesse articulatoire", mean: 5.60, sd: 0.53, upperBound2SD: 6.26, lowerBound2SD: null, unit: "syll/s" },
    { label: "Variabilité de la vitesse articulatoire", mean: 2.35, sd: 0.79, upperBound2SD: 3.34, lowerBound2SD: null, unit: "syll/s", direction: "higher_is_worse" },
    { label: "Disfluences normales", mean: 2.25, sd: 2.28, upperBound2SD: 5.10, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Disfluences bègues", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

// Texte de Pierrot (Maupassant)
export const READING_TEXT = `Les deux femmes habitaient une petite maison à volets verts, le long d'une route en Normandie, au centre du pays de Caux.

Comme elles possédaient, devant l'habitation, un étroit jardin, elles cultivaient quelques légumes.

Or, une nuit, on lui vola une douzaine d'oignons.

Dès que Rose s'aperçut du larcin, elle courut prévenir madame, qui descendit en jupe de laine. Ce fut une désolation et une terreur. On avait volé, volé Mme Lefebvre !

Donc, on volait dans le pays, puis on pouvait revenir.

Et les deux femmes effarées contemplaient les traces de pas, bavardaient, supposaient des choses : « Tenez, ils ont passé par là. Ils ont mis leurs pieds sur le mur ; ils ont sauté dans la plate-bande. »

Et elles s'épouvantaient pour l'avenir. Comment dormir tranquillement maintenant.`;

// Nombre de syllabes du texte de lecture (compté manuellement sur le corpus officiel)
export const READING_TEXT_SYLLABLES = 200;

// ====== COPIE (Soie — Baricco) ======
export const COPY_TEXT = `Bien que son père eût imaginé pour lui un brillant avenir dans l'armée, Hervé Joncour avait fini par gagner sa vie grâce à une profession insolite, à laquelle n'étaient pas étrangers, par une singulière ironie, des traits à ce point aimables qu'ils trahissaient une vague inflexion féminine.

Pour vivre, Hervé Joncour achetait et vendait des vers à soie.

On était en 1861. Flaubert écrivait Salammbô, l'éclairage électrique n'était encore qu'une hypothèse et Abraham Lincoln, de l'autre côté de l'Océan, livrait une guerre dont il ne verrait pas la fin.`;

export const COPY_NORMS_SLOW: TaskNorms = {
  taskName: "Copie lente",
  variables: [
    { label: "Corrections d'erreurs", mean: 1.10, sd: 1.51, upperBound2SD: 2.99, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.07, sd: 0.25, upperBound2SD: 0.38, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

export const COPY_NORMS_FAST: TaskNorms = {
  taskName: "Copie rapide",
  variables: [
    { label: "Corrections d'erreurs", mean: 1.93, sd: 2.34, upperBound2SD: 4.86, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.08, sd: 0.28, upperBound2SD: 0.43, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

export const WRITING_NORMS_FREE: TaskNorms = {
  taskName: "Écriture spontanée sans contrainte",
  variables: [
    { label: "Corrections d'erreurs", mean: 2.13, sd: 2.15, upperBound2SD: 4.82, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.00, sd: 0.00, upperBound2SD: 0.00, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs syntaxiques", mean: 0.08, sd: 0.38, upperBound2SD: 0.55, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

export const WRITING_NORMS_TIMED: TaskNorms = {
  taskName: "Écriture spontanée avec contrainte",
  variables: [
    { label: "Corrections d'erreurs", mean: 1.54, sd: 1.48, upperBound2SD: 3.39, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Télescopages", mean: 0.02, sd: 0.13, upperBound2SD: 0.18, lowerBound2SD: null, direction: "higher_is_worse" },
    { label: "Erreurs syntaxiques", mean: 0.10, sd: 0.44, upperBound2SD: 0.65, lowerBound2SD: null, direction: "higher_is_worse" },
  ]
};

// ====== PCI Items (Test prédictif) ======
export const PCI_ITEMS = [
  "Compétences de planification médiocres, difficultés pour utiliser le temps de façon optimale",
  "Peu ou pas d'effort excessif observé pendant les disfluences",
  "Débit de parole irrégulier, parle par salves ou à coups",
  "Télescopages ou mots raccourcis",
  "Débit rapide (tachylalie)",
  "Voix initialement forte se terminant en un murmure inintelligible",
  "Manque de pauses entre les mots et les phrases",
  "Répétition de mots multi-syllabiques et de phrases",
  "Coexistence de disfluences excessive et de bégaiement",
  "Coordination orale diadococinétique en deçà des niveaux attendus",
];

// ====== Types de disfluences (grille de cotation) ======
export const DISFLUENCY_TYPES = [
  { key: "word_repetition", label: "Répétition de mot", category: "normal" },
  { key: "segment_interjection", label: "Répétition de segment / Interjection", category: "normal" },
  { key: "revision", label: "Révision", category: "normal" },
  { key: "pause_error", label: "Erreur de pause", category: "normal" },
  { key: "telescopage", label: "Télescopage", category: "cluttering" },
  { key: "blocage", label: "Blocage", category: "stuttering" },
  { key: "prolongation", label: "Prolongation", category: "stuttering" },
  { key: "tense_word_repetition", label: "Répétition de mot tendue", category: "stuttering" },
] as const;

// ====== INTERPRÉTATION ======
export const INTERPRETATION_RULES = {
  // Vitesse articulatoire : différence entre modes
  speedDifferenceThreshold: 1.0, // ≤1 SPS = indication bredouillement
  // Variabilité : différence max-min dans un mode
  variabilityThreshold: 3.0, // >3 SPS = indication bredouillement
};

/**
 * Compare une valeur observée à la norme et retourne le statut
 */
export function compareToNorm(
  observed: number,
  norm: NormValue
): 'normal' | 'borderline' | 'atypical' {
  if (norm.direction === 'lower_is_worse') {
    if (norm.lowerBound2SD !== null && observed < norm.lowerBound2SD) return 'atypical';
    if (norm.lowerBound2SD !== null && observed < norm.mean - norm.sd) return 'borderline';
    return 'normal';
  }
  // Default: higher is worse
  if (norm.upperBound2SD !== null && observed > norm.upperBound2SD) return 'atypical';
  if (observed > norm.mean + norm.sd) return 'borderline';
  return 'normal';
}
