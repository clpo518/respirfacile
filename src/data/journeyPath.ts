/**
 * Journey Path: 8-step guided progression (Duolingo-style)
 * Each step maps to an exercise category with 3 exercises to validate.
 */

export interface JourneyStep {
  index: number;
  categoryId: string;
  title: string;
  icon: string;
  description: string;
  exerciseIds: string[]; // 3 exercises to validate
  requiredValidations: number;
}

/** Default journey for "speed" goal (bredouillement / tachylalie) */
export const JOURNEY_STEPS_SPEED: JourneyStep[] = [
  {
    index: 0,
    categoryId: "warmup",
    title: "Échauffement",
    icon: "🏋️",
    description: "Déliez votre langue en douceur",
    exerciseIds: ["warmup-1", "warmup-2", "warmup-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "slow-reading",
    title: "Ralentir le débit",
    icon: "🌱",
    description: "Apprenez à poser votre rythme",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 2,
    categoryId: "breath-control",
    title: "Souffle & pauses",
    icon: "🌬️",
    description: "Respirez pour mieux parler",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "daily-life",
    title: "Vie quotidienne",
    icon: "📧",
    description: "Transférez dans la vraie vie",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "articulation",
    title: "Défis d'articulation",
    icon: "👅",
    description: "Gagnez en précision",
    exerciseIds: ["artic-1", "artic-2", "artic-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "improvisation",
    title: "Oral libre",
    icon: "🎤",
    description: "Parlez sans filet",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "cognitive-traps",
    title: "Pièges cognitifs",
    icon: "🧠",
    description: "Gardez le cap sous pression",
    exerciseIds: ["trap-1", "trap-2", "trap-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Récit résumé",
    icon: "📖",
    description: "Synthétisez et racontez",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

/** Journey for "fluency" goal (bégaiement, blocages, répétitions) */
export const JOURNEY_STEPS_FLUENCY: JourneyStep[] = [
  {
    index: 0,
    categoryId: "breath-control",
    title: "Respiration & souffle",
    icon: "🌬️",
    description: "Posez les bases de la fluence",
    exerciseIds: ["breath-1", "breath-2", "breath-3"],
    requiredValidations: 3,
  },
  {
    index: 1,
    categoryId: "silence-training",
    title: "Tolérance au silence",
    icon: "🧘",
    description: "Apprivoisez les pauses",
    exerciseIds: ["silence-1", "silence-2", "silence-3"],
    requiredValidations: 3,
  },
  {
    index: 2,
    categoryId: "fluency-reading",
    title: "Lecture douce",
    icon: "🌊",
    description: "Textes adaptés à la fluence",
    exerciseIds: ["fluency-read-1", "fluency-read-2", "fluency-read-3"],
    requiredValidations: 3,
  },
  {
    index: 3,
    categoryId: "slow-reading",
    title: "Ralentir en douceur",
    icon: "🌱",
    description: "Ralentissez sans forcer",
    exerciseIds: ["slow-1", "slow-2", "slow-3"],
    requiredValidations: 3,
  },
  {
    index: 4,
    categoryId: "daily-life",
    title: "Vie quotidienne",
    icon: "📧",
    description: "Transférez dans la vraie vie",
    exerciseIds: ["daily-1", "daily-2", "daily-3"],
    requiredValidations: 3,
  },
  {
    index: 5,
    categoryId: "improvisation",
    title: "Oral libre",
    icon: "🎤",
    description: "Parlez librement, à votre rythme",
    exerciseIds: ["impro-1", "impro-2", "impro-3"],
    requiredValidations: 3,
  },
  {
    index: 6,
    categoryId: "dialogue",
    title: "Mode Dialogue",
    icon: "💬",
    description: "Transfert en situation réelle",
    exerciseIds: ["dialogue-1", "dialogue-2", "dialogue-3"],
    requiredValidations: 3,
  },
  {
    index: 7,
    categoryId: "retelling",
    title: "Récit résumé",
    icon: "📖",
    description: "Synthétisez et racontez",
    exerciseIds: ["retelling-1", "retelling-2", "retelling-3"],
    requiredValidations: 3,
  },
];

/** Backward-compatible export — defaults to speed journey */
export const JOURNEY_STEPS = JOURNEY_STEPS_SPEED;

/** Get journey steps based on fluency goal */
export function getJourneySteps(goal: string | null | undefined): JourneyStep[] {
  return goal === "fluency" ? JOURNEY_STEPS_FLUENCY : JOURNEY_STEPS_SPEED;
}

export const TOTAL_STEPS = JOURNEY_STEPS_SPEED.length;
