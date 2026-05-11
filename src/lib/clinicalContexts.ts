// ─────────────────────────────────────────────────────────────────
// Cadre clinique des exercices respirfacile
//
// Mappe chaque catégorie d'exercices (et certains exercices spécifiques)
// à son rationnel clinique : cadre théorique, indication, mécanisme,
// métriques suivies, contre-indications éventuelles, référence biblio.
//
// Utilisé exclusivement côté praticien (orthophoniste / kinésithérapeute)
// via le composant <ClinicalContextBadge />. Jamais affiché aux patients.
//
// Sources : page Notion d'étude clinique respirfacile
//   https://www.notion.so/escape-kit/340aec4690b280b19020e6cf4f466b3d
// ─────────────────────────────────────────────────────────────────

import type { ExerciseCategory } from "@/data/exercises"

export interface ClinicalContext {
  /** Cadre clinique court (ex: "OMT", "Buteyko", "Cohérence cardiaque") */
  framework: string
  /** Nom complet à afficher dans le popover */
  frameworkFull: string
  /** Indication principale (à qui, pour quoi) */
  indication: string
  /** Mécanisme d'action physiopathologique */
  mechanism: string
  /** Métriques cliniquement suivies */
  metrics: string[]
  /** Précaution / contre-indication éventuelle */
  caution?: string
  /** Référence bibliographique principale */
  reference?: string
}

// ─────────────────────────────────────────────────────────────────
// Cadres par catégorie d'exercices
// ─────────────────────────────────────────────────────────────────

const CATEGORY_CONTEXTS: Record<ExerciseCategory, ClinicalContext> = {
  pause_controlee: {
    framework: "Pause Contrôlée",
    frameworkFull: "Pause Contrôlée (méthode Buteyko, adapté SAOS)",
    indication:
      "SAOS léger à modéré, TMOF, profil mixte. Calibrage de la tolérance au CO2 comme marqueur d'efficacité respiratoire.",
    mechanism:
      "Augmente progressivement la tolérance des chémorécepteurs au CO2, réduit l'hyperventilation chronique souvent associée à la respiration buccale et au SAOS.",
    metrics: [
      "Score Pause Contrôlée (secondes ou nombre de pas)",
      "Niveau d'inconfort ressenti (1-10)",
      "Évolution hebdomadaire",
    ],
    caution:
      "Ne pas prescrire en SAOS sévère non appareillé sans avis pneumologue préalable (risque sur patient déjà désaturé).",
    reference:
      "Camacho et al., Sleep 2015, PMC4402674 — méta-analyse 9 RCTs, -50% IAH chez l'adulte avec OMT.",
  },

  coherence_cardiaque: {
    framework: "Cohérence cardiaque",
    frameworkFull: "Cohérence cardiaque (HRV biofeedback, protocole 5-5 ou 4-6)",
    indication:
      "Tous profils SAOS et TMOF, y compris SAOS sévère. Travail du système autonome et de la qualité subjective du sommeil.",
    mechanism:
      "Active le système parasympathique via le nerf vague, réduit le tonus sympathique, améliore la variabilité de la fréquence cardiaque (HRV) et la qualité du sommeil rapportée.",
    metrics: [
      "Régularité du cycle inspiration / expiration",
      "Nombre de cycles complétés",
      "Qualité subjective du sommeil (PSQI / échelle 1-10)",
    ],
    reference:
      "Sadey 2022 (DUMAS-03980493) — amélioration ESS et PSQI dans toutes les études analysées.",
  },

  respiration_nasale: {
    framework: "Rééducation nasale",
    frameworkFull: "Rééducation respiratoire nasale (R1-R8)",
    indication:
      "Tous profils. Particulièrement pertinent pour TMOF pure et patients avec antécédent de respiration buccale chronique.",
    mechanism:
      "Réduit la résistance nasale fonctionnelle, restaure la production de NO endogène (vasodilatateur pulmonaire), améliore le filtrage et le réchauffement de l'air inspiré.",
    metrics: [
      "Durée de respiration exclusivement nasale",
      "Score NOSE (gêne nasale 0-4)",
      "Observance jour/nuit",
    ],
    reference:
      "Lin et al. 2022, PMC9498581 — rééducation nasale recommandée précocement, lien fort avec développement dentofacial.",
  },

  myofonctionnel: {
    framework: "OMT",
    frameworkFull: "Thérapie Myofonctionnelle Orofaciale (OMT / TMOF)",
    indication:
      "SAOS léger à modéré, TMOF, profil mixte. Cible la tonification génioglosse + voile du palais pour réduire le collapsus pharyngé nocturne.",
    mechanism:
      "Tonifie le génioglosse (empêche la chute postérieure de la langue), renforce le voile du palais (réduit les vibrations / ronflement), réhabitue la posture linguale haute au repos.",
    metrics: [
      "Force et endurance linguale",
      "Posture de repos (langue contre palais)",
      "Réduction du ronflement (intensité, durée)",
      "IAH (suivi 3-6 mois via polysomnographie)",
    ],
    caution:
      "Progression à doser : forçage rapide vers les exercices avancés peut induire hypertonie, bruxisme, cervicalgies. Validation morphologique en cabinet recommandée avant exercices L4, L8, L9.",
    reference:
      "Camacho 2015 (PMC4402674), Heude 2024 (DUMAS-04760461 — génioglosse seul insuffisant, protocole multi-cibles nécessaire).",
  },

  diaphragmatique: {
    framework: "Respiration diaphragmatique",
    frameworkFull: "Respiration abdominale / diaphragmatique consciente",
    indication:
      "Tous profils SAOS et TMOF, y compris SAOS sévère sous CPAP. Réhabilite le pattern respiratoire physiologique.",
    mechanism:
      "Recrute le diaphragme comme muscle respiratoire principal, désengage la respiration thoracique haute superficielle souvent associée au stress et à la mauvaise oxygénation nocturne.",
    metrics: [
      "Régularité du cycle",
      "Amplitude abdominale vs thoracique",
      "Fréquence respiratoire au repos (cycles/min)",
    ],
    reference:
      "Protocoles classiques rééducation respiratoire (kinésithérapie + orthophonie).",
  },

  relaxation: {
    framework: "Relaxation guidée",
    frameworkFull: "Techniques de détente neuromusculaire",
    indication:
      "Complément en fin de séance ou avant le coucher. Tous profils.",
    mechanism:
      "Diminue le tonus musculaire pharyngé via détente globale, réduit le stress sympathique pré-endormissement.",
    metrics: ["Qualité subjective d'endormissement", "Score de détente 1-10"],
  },
}

// ─────────────────────────────────────────────────────────────────
// Overrides par exercice spécifique (optionnel)
// Quand un exercice mérite un cadre plus précis que sa catégorie.
// ─────────────────────────────────────────────────────────────────

const EXERCISE_OVERRIDES: Record<string, Partial<ClinicalContext>> = {
  aspiration_langue: {
    framework: "OMT — exercice phare",
    indication:
      "L'un des exercices OMT les plus efficaces selon la littérature. Cible directement la tonification linguale globale.",
    caution:
      "À introduire seulement après validation morphologique en cabinet (frein lingual, voûte palatine). Risque de cervicalgies si forçage. Niveau intermédiaire à avancé.",
  },
  pause_25: {
    caution:
      "Exclure SAOS sévère non appareillé. Vérifier ESS et antécédents avant prescription. Niveau avancé.",
  },
  gargarisme: {
    framework: "OMT — voile du palais",
    reference:
      "Cible spécifique de la famille V (voile). Alternative française et accessible au didgeridoo, qui est efficace en RCT mais inutilisable en pratique courante.",
  },
}

// ─────────────────────────────────────────────────────────────────
// API publique
// ─────────────────────────────────────────────────────────────────

export function getClinicalContext(
  category: ExerciseCategory,
  exerciseId?: string,
): ClinicalContext {
  const base = CATEGORY_CONTEXTS[category]
  if (!exerciseId) return base
  const override = EXERCISE_OVERRIDES[exerciseId]
  if (!override) return base
  return { ...base, ...override }
}

export function hasClinicalContext(category: string): category is ExerciseCategory {
  return category in CATEGORY_CONTEXTS
}
