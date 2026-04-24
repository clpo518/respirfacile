export type ExerciseCategory =
  | 'pause_controlee'
  | 'coherence_cardiaque'
  | 'respiration_nasale'
  | 'myofonctionnel'
  | 'diaphragmatique'
  | 'relaxation';

// Compatibility type for legacy PMV components
export interface RebusSegment {
  text: string;
  isPause?: boolean;
  duration?: number;
}

export type PatientProfile =
  | 'adult_saos_mild'
  | 'adult_saos_severe'
  | 'adult_tmof'
  | 'adult_mixed';

export interface Exercise {
  id: string;
  category: ExerciseCategory;
  name_fr: string;
  duration_seconds: number;
  sets?: number;
  difficulty: 1 | 2 | 3;
  contraindications?: string[];
  instructions_fr: string[];
  metrics_tracked: string[];
  target_profile: PatientProfile[];
  description_fr: string;
  family_icon: string;
}

export const EXERCISES: Exercise[] = [
  // Pause Contrôlée
  {
    id: 'pause_decouverte',
    category: 'pause_controlee',
    name_fr: 'Découverte de la Pause Contrôlée',
    duration_seconds: 300,
    difficulty: 1,
    description_fr:
      'Apprenez à mesurer votre tolérance naturelle au CO2 — le point de départ de votre progression.',
    instructions_fr: [
      'Respirez normalement par le nez, 3 fois',
      'Après une expiration normale, pincez doucement les narines',
      'Marchez lentement et comptez les pas jusqu\'au premier inconfort',
      'Notez votre score (nombre de pas)',
      'Respirez normalement — ne jamais forcer',
    ],
    metrics_tracked: ['pause_steps', 'comfort_level'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '🫁',
  },
  {
    id: 'pause_20',
    category: 'pause_controlee',
    name_fr: 'Pause 20 secondes',
    duration_seconds: 600,
    difficulty: 2,
    description_fr:
      'Objectif : tenir une pause confortable de 20 secondes. Marqueur de bonne tolérance CO2.',
    instructions_fr: [
      'Inspirez normalement par le nez',
      'Expirez doucement',
      'Bloquez le souffle après l\'expiration',
      'Maintenez jusqu\'à 20 secondes',
      'Répétez 5 fois avec 2 minutes de repos entre chaque',
    ],
    metrics_tracked: ['pause_duration', 'comfort_level'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '🫁',
  },
  {
    id: 'pause_25',
    category: 'pause_controlee',
    name_fr: 'Pause 25 secondes',
    duration_seconds: 600,
    difficulty: 3,
    description_fr:
      'Niveau avancé — 25 secondes de pause confortable indique une bonne rééducation respiratoire.',
    instructions_fr: [
      'Respirez normalement 3 fois par le nez',
      'Expirez et bloquez',
      'Maintenez jusqu\'à 25 secondes confortablement',
      'Répétez 5 fois',
    ],
    metrics_tracked: ['pause_duration', 'comfort_level'],
    target_profile: ['adult_saos_mild', 'adult_mixed'],
    family_icon: '🫁',
  },

  // Cohérence cardiaque
  {
    id: 'coherence_5_5',
    category: 'coherence_cardiaque',
    name_fr: 'Cohérence cardiaque 5-5',
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    description_fr:
      '5 minutes de respiration rythmée. Réduit le stress, améliore la qualité du sommeil.',
    instructions_fr: [
      'Inspirez par le nez pendant 5 secondes',
      'Expirez par le nez pendant 5 secondes',
      'Répétez sans interruption pendant 5 minutes',
      'Idéal 3 fois par jour (matin, midi, soir)',
    ],
    metrics_tracked: ['cycles_completed', 'regularity_score'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    family_icon: '💓',
  },
  {
    id: 'coherence_4_6',
    category: 'coherence_cardiaque',
    name_fr: 'Cohérence cardiaque 4-6',
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    description_fr:
      'Variante avec expiration prolongée — favorise la détente et le sommeil.',
    instructions_fr: [
      'Inspirez par le nez pendant 4 secondes',
      'Expirez par le nez pendant 6 secondes',
      'L\'expiration plus longue active le système parasympathique',
      'Répétez 5 minutes',
    ],
    metrics_tracked: ['cycles_completed'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    family_icon: '💓',
  },

  // Myofonctionnel
  {
    id: 'langue_repos',
    category: 'myofonctionnel',
    name_fr: 'Position de repos de la langue',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'L\'exercice fondamental. La langue doit reposer contre le palais, pas entre les dents.',
    instructions_fr: [
      'Fermez la bouche naturellement',
      'Placez la pointe de la langue contre le palais dur, juste derrière les incisives supérieures',
      'Maintenez 2 minutes en respirant par le nez',
      'Si vous oubliez, c\'est normal — reprenez',
    ],
    metrics_tracked: ['hold_duration'],
    target_profile: ['adult_tmof', 'adult_mixed', 'adult_saos_mild'],
    family_icon: '👅',
  },
  {
    id: 'claquement_langue',
    category: 'myofonctionnel',
    name_fr: 'Claquement de langue',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Renforce le génioglosse — le muscle qui empêche la langue de retomber en arrière pendant le sommeil.',
    instructions_fr: [
      'Placez la langue contre le palais',
      'Faites claquer la langue vers le bas (comme un "tsk")',
      'Répétez 20 fois',
      '3 séries avec 30 secondes de repos',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '👅',
  },
  {
    id: 'aspiration_langue',
    category: 'myofonctionnel',
    name_fr: 'Aspiration linguale',
    duration_seconds: 150,
    difficulty: 2,
    description_fr:
      'Renforce toute la langue contre le palais — l\'un des exercices OMT les plus efficaces.',
    instructions_fr: [
      'Collez toute la langue contre le palais',
      'Ouvrez la bouche le plus possible sans décoller la langue',
      'Maintenez 30 secondes',
      '5 répétitions',
    ],
    metrics_tracked: ['hold_duration', 'reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '👅',
  },
  {
    id: 'gargarisme',
    category: 'myofonctionnel',
    name_fr: 'Gargarisme (voile du palais)',
    duration_seconds: 90,
    difficulty: 1,
    description_fr: 'Renforce le voile du palais — réduit le ronflement.',
    instructions_fr: [
      'Prenez une petite gorgée d\'eau',
      'Faites un gargarisme fort pendant 30 secondes',
      'Répétez 3 fois',
      'Idéal le matin après le brossage',
    ],
    metrics_tracked: ['duration_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '🗣️',
  },
  {
    id: 'phonemes_kaga',
    category: 'myofonctionnel',
    name_fr: 'Phonèmes Ka-Ga-Ra',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Exercice phonétique pour renforcer le voile du palais et la base de la langue.',
    instructions_fr: [
      'Prononcez distinctement "Ka" 10 fois',
      'Puis "Ga" 10 fois',
      'Puis "Ra" 10 fois (en roulant le R)',
      'Répétez 3 séries',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '🗣️',
  },

  // Respiration nasale
  {
    id: 'nasale_consciente',
    category: 'respiration_nasale',
    name_fr: 'Respiration nasale consciente',
    duration_seconds: 180,
    difficulty: 1,
    description_fr:
      'Rééducation de base — réapprendre à respirer exclusivement par le nez.',
    instructions_fr: [
      'Fermez la bouche',
      'Inspirez doucement par le nez',
      'Expirez doucement par le nez',
      'Sentez l\'air filtré et réchauffé',
      'Maintenez 3 minutes en position assise',
    ],
    metrics_tracked: ['duration_nasal_only'],
    target_profile: [
      'adult_saos_mild',
      'adult_tmof',
      'adult_mixed',
      'adult_saos_severe',
    ],
    family_icon: '👃',
  },
  {
    id: 'narine_alternee',
    category: 'respiration_nasale',
    name_fr: 'Respiration en narine alternée',
    duration_seconds: 300,
    difficulty: 2,
    description_fr:
      'Technique de pranayama — débouche les narines et équilibre la respiration.',
    instructions_fr: [
      'Bouchez la narine droite avec le pouce',
      'Inspirez par la narine gauche pendant 4 secondes',
      'Bouchez la narine gauche, libérez la droite',
      'Expirez par la narine droite pendant 4 secondes',
      'Répétez en alternant pendant 5 minutes',
    ],
    metrics_tracked: ['cycles_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    family_icon: '👃',
  },

  // Diaphragmatique
  {
    id: 'respiration_diaphragmatique',
    category: 'diaphragmatique',
    name_fr: 'Respiration diaphragmatique',
    duration_seconds: 300,
    difficulty: 1,
    description_fr:
      'Respiration abdominale profonde — active le diaphragme, réduit la respiration thoracique superficielle.',
    instructions_fr: [
      'Allongez-vous ou asseyez-vous confortablement',
      'Posez une main sur le ventre, une sur la poitrine',
      'Inspirez par le nez — le ventre doit se gonfler, pas la poitrine',
      'Expirez lentement — le ventre redescend',
      'La main sur la poitrine doit rester immobile',
    ],
    metrics_tracked: ['cycles_completed', 'regularity_score'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    family_icon: '🫁',
  },
];

export const EXERCISE_FAMILIES = [
  {
    id: 'pause_controlee',
    label: 'Pause Contrôlée',
    icon: '🫁',
    color: 'blue',
  },
  {
    id: 'coherence_cardiaque',
    label: 'Cohérence cardiaque',
    icon: '💓',
    color: 'pink',
  },
  {
    id: 'myofonctionnel',
    label: 'Myofonctionnel',
    icon: '👅',
    color: 'orange',
  },
  {
    id: 'respiration_nasale',
    label: 'Respiration nasale',
    icon: '👃',
    color: 'green',
  },
  {
    id: 'diaphragmatique',
    label: 'Diaphragmatique',
    icon: '🫁',
    color: 'teal',
  },
];

// Helper functions
export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter((ex) => ex.category === category);
}

export function getExercisesByProfile(profile: PatientProfile): Exercise[] {
  return EXERCISES.filter((ex) => ex.target_profile.includes(profile));
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((ex) => ex.id === id);
}

export function getExerciseFamily(id: string) {
  return EXERCISE_FAMILIES.find((f) => f.id === id);
}

export function getCategoryById(id: string) {
  const family = EXERCISE_FAMILIES.find((f) => f.id === id);
  if (!family) return undefined;
  return {
    ...family,
    title: family.label, // alias for compatibility
  };
}

// ── Compatibility exports for legacy components ─────────────────────────────

// exerciseCategories: array used by AssignExerciseModal, Library, useDailyExercise
export const exerciseCategories = EXERCISE_FAMILIES.map((f) => ({
  id: f.id as ExerciseCategory,
  title: f.label,
  icon: f.icon,
  color: f.color,
  description: '',
}));

// EXERCISES_BY_CATEGORY: used by Practice.tsx
export const EXERCISES_BY_CATEGORY: Record<ExerciseCategory, Exercise[]> = {
  pause_controlee: EXERCISES.filter((e) => e.category === 'pause_controlee'),
  coherence_cardiaque: EXERCISES.filter((e) => e.category === 'coherence_cardiaque'),
  respiration_nasale: EXERCISES.filter((e) => e.category === 'respiration_nasale'),
  myofonctionnel: EXERCISES.filter((e) => e.category === 'myofonctionnel'),
  diaphragmatique: EXERCISES.filter((e) => e.category === 'diaphragmatique'),
  relaxation: [],
};

// PROGRAM_TEMPLATES: used by usePatientProgram
export const PROGRAM_TEMPLATES: Record<string, { exerciseIds: string[] }> = {
  adult_saos_mild: {
    exerciseIds: [
      'pause_decouverte',
      'coherence_5_5',
      'langue_repos',
      'nasale_consciente',
      'respiration_diaphragmatique',
    ],
  },
  adult_saos_severe: {
    exerciseIds: [
      'coherence_5_5',
      'coherence_4_6',
      'langue_repos',
      'aspiration_langue',
      'respiration_diaphragmatique',
    ],
  },
  adult_tmof: {
    exerciseIds: [
      'langue_repos',
      'claquement_langue',
      'aspiration_langue',
      'gargarisme',
      'phonemes_kaga',
      'nasale_consciente',
    ],
  },
  adult_mixed: {
    exerciseIds: [
      'pause_decouverte',
      'coherence_5_5',
      'langue_repos',
      'aspiration_langue',
      'nasale_consciente',
      'respiration_diaphragmatique',
    ],
  },
};
