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
  icon: string;
  /** Exercice avec production vocale — patient produit des sons mesurables */
  voice_exercise?: boolean;
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
    icon: '🫁',
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
    icon: '🫁',
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
    icon: '🫁',
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
    icon: '💓',
  },
  {
    id: 'coherence_4_6',
    category: 'coherence_cardiaque',
    name_fr: 'Cohérence Cardiaque · Expiration longue',
    duration_seconds: 300,
    sets: 5,
    difficulty: 1,
    description_fr:
      'Expiration 6s > inspiration 4s — active le système parasympathique. Idéal avant le coucher.',
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
    icon: '💓',
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
    icon: '👅',
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
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '👅',
  },
  {
    id: 'aspiration_langue',
    category: 'myofonctionnel',
    name_fr: 'Aspiration de la langue',
    duration_seconds: 150,
    difficulty: 2,
    description_fr:
      'Renforce toute la langue contre le palais dur — présent dans tous les protocoles OMT validés. L\'étude AirwayGym (2020) obtient −53 % d\'IAH avec ce type d\'exercice pratiqué quotidiennement.',
    instructions_fr: [
      'Collez toute la langue contre le palais',
      'Ouvrez la bouche le plus possible sans décoller la langue',
      'Maintenez 30 secondes',
      '5 répétitions',
    ],
    metrics_tracked: ['hold_duration', 'reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    icon: '👅',
  },
  {
    id: 'gargarisme',
    category: 'myofonctionnel',
    name_fr: 'Gargarisme',
    duration_seconds: 90,
    difficulty: 1,
    description_fr: 'Renforce le voile du palais en vibration active — réduit le ronflement de façon mesurable.',
    instructions_fr: [
      'Prenez une petite gorgée d\'eau',
      'Faites un gargarisme fort pendant 30 secondes',
      'Sentez la vibration au fond de la gorge',
      'Répétez 3 fois',
      'Idéal le matin après le brossage',
    ],
    metrics_tracked: ['duration_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '🗣️',
    voice_exercise: true,
  },
  {
    id: 'phonemes_kaga',
    category: 'myofonctionnel',
    name_fr: 'Phonèmes Ka-Ga-Ra',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Articulation phonétique guidée — renforce le voile du palais et la base de la langue par vibration vocale.',
    instructions_fr: [
      'Prononcez distinctement "Ka" 10 fois',
      'Puis "Ga" 10 fois',
      'Puis "Ra" 10 fois (en roulant le R)',
      'Répétez 3 séries',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '🗣️',
    voice_exercise: true,
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
    icon: '👃',
  },
  {
    id: 'narine_alternee',
    category: 'respiration_nasale',
    name_fr: 'Respiration en narine alternée',
    duration_seconds: 300,
    difficulty: 2,
    description_fr:
      'Technique de pranayama — désencombre les narines et rééduque la respiration nasale exclusive. Réduit la résistance des voies aériennes supérieures.',
    instructions_fr: [
      'Bouchez la narine droite avec le pouce',
      'Inspirez par la narine gauche pendant 4 secondes',
      'Bouchez la narine gauche, libérez la droite',
      'Expirez par la narine droite pendant 4 secondes',
      'Répétez en alternant pendant 5 minutes',
    ],
    metrics_tracked: ['cycles_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '👃',
  },

  // Diaphragmatique
  {
    id: 'respiration_diaphragmatique',
    category: 'diaphragmatique',
    name_fr: 'Respiration abdominale',
    duration_seconds: 300,
    difficulty: 1,
    description_fr:
      'Respiration profonde par le ventre — active le diaphragme, réduit la respiration thoracique superficielle.',
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
    icon: '🫁',
  },

  // Myofonctionnel — exercices complémentaires
  {
    id: 'protrusion_langue',
    category: 'myofonctionnel',
    name_fr: 'Protrusion de la langue',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Étire et tonifie les muscles de la langue dans toutes les directions — améliore le tonus lingual global.',
    instructions_fr: [
      'Tirez la langue aussi loin que possible vers le bas (vers le menton)',
      'Maintenez 5 secondes',
      'Tirez-la vers la gauche — maintenez 5 secondes',
      'Puis vers la droite — maintenez 5 secondes',
      'Enfin vers le haut (vers le nez) — maintenez 5 secondes',
      'Répétez 5 fois chaque direction',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '👅',
  },
  {
    id: 'son_ah_tenu',
    category: 'myofonctionnel',
    name_fr: 'Son "Ah" tenu',
    duration_seconds: 90,
    difficulty: 1,
    description_fr:
      'Vocalisation prolongée qui fait vibrer et renforce le voile du palais — réduit les vibrations du ronflement.',
    instructions_fr: [
      'Inspirez profondément par le nez',
      'Produisez un son "Aaah" long et stable',
      'Sentez la vibration au fond de la gorge et du palais',
      'Tenez le son aussi longtemps que possible (objectif : 10 secondes)',
      'Répétez 5 fois avec 15 secondes de repos entre chaque',
    ],
    metrics_tracked: ['hold_duration', 'reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '🗣️',
    voice_exercise: true,
  },
  {
    id: 'deglutition_correcte',
    category: 'myofonctionnel',
    name_fr: 'Déglutition correcte',
    duration_seconds: 180,
    difficulty: 2,
    description_fr:
      'Rééduque le schéma de déglutition — corrige la poussée linguale atypique qui aggrave les troubles respiratoires nocturnes.',
    instructions_fr: [
      'Placez la pointe de la langue contre le palais dur, juste derrière les incisives',
      'Fermez les dents et les lèvres naturellement',
      'Avalez de la salive sans pousser la langue entre les dents',
      'Vérifiez : les joues ne doivent pas se contracter',
      'Répétez 20 déglutitions conscientes',
      'Idéal à pratiquer avant chaque repas',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_tmof', 'adult_mixed', 'adult_saos_mild'],
    icon: '👅',
  },

  // Myofonctionnel — exercices lèvres & voile (validés Guimarães 2009, PMC5699856)
  {
    id: 'tenue_levres',
    category: 'myofonctionnel',
    name_fr: 'Fermeture labiale',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Renforce les muscles des lèvres (orbicularis oris) — corrige la respiration buccale nocturne. Essai clinique : IAH de 12,2 à 3,9 avec cet exercice seul.',
    instructions_fr: [
      'Fermez les lèvres en les pressant légèrement l\'une contre l\'autre',
      'Maintenez sans contracter les joues ni le menton',
      'Respirez uniquement par le nez tout au long',
      'Tenez 30 secondes puis relâchez complètement',
      'Répétez 10 fois',
    ],
    metrics_tracked: ['hold_duration', 'reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '👄',
  },
  {
    id: 'balayage_palais',
    category: 'myofonctionnel',
    name_fr: 'Balayage du palais',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Mobilise la langue sur toute la voûte palatine — améliore l\'indépendance langue-mâchoire. Inclus dans le protocole de Guimarães (2009, AJRCCM), essai fondateur du traitement OMT du SAOS.',
    instructions_fr: [
      'Placez la pointe de la langue contre le palais, juste derrière les incisives',
      'Faites glisser lentement la langue vers l\'arrière, aussi loin que possible',
      'Revenez vers l\'avant en frottant fermement le palais',
      '15 allers-retours consécutifs',
      '3 séries avec 20 secondes de repos',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_tmof', 'adult_mixed'],
    icon: '👅',
  },
  {
    id: 'elevation_voile_palais',
    category: 'myofonctionnel',
    name_fr: 'Élévation du voile du palais',
    duration_seconds: 120,
    difficulty: 1,
    description_fr:
      'Renforce le voile du palais mou — exercice central du protocole Guimarães 2009 (−50 % IAH). Tonifie les muscles vélaires qui s\'affaissent pendant le sommeil.',
    instructions_fr: [
      'Devant un miroir, ouvrez la bouche en grand',
      'Prononcez lentement "Aaa" 20 fois : observez la luette qui monte',
      'Enchaînez "E-I-E-I-E" 10 fois en accentuant le mouvement',
      'La luette doit remonter nettement à chaque voyelle',
      '3 séries avec 20 secondes de repos',
    ],
    metrics_tracked: ['reps_completed'],
    target_profile: ['adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed'],
    icon: '🗣️',
    voice_exercise: true,
  },

  // Cohérence cardiaque — exercices complémentaires
  {
    id: 'box_breathing',
    category: 'coherence_cardiaque',
    name_fr: 'Respiration en carré',
    duration_seconds: 300,
    difficulty: 1,
    description_fr:
      'Technique utilisée par les forces spéciales — 4 temps égaux de 4 secondes. Calme rapidement le système nerveux autonome.',
    instructions_fr: [
      'Inspirez par le nez pendant 4 secondes',
      'Retenez le souffle, poumons pleins, pendant 4 secondes',
      'Expirez par la bouche pendant 4 secondes',
      'Retenez à vide pendant 4 secondes',
      'Répétez ce cycle pendant 5 minutes',
    ],
    metrics_tracked: ['cycles_completed'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    icon: '⬛',
  },
  {
    id: 'respiration_478',
    category: 'coherence_cardiaque',
    name_fr: 'Respiration 4-7-8',
    duration_seconds: 240,
    difficulty: 2,
    description_fr:
      'Technique du Dr Andrew Weil — favorise un endormissement rapide. Idéal au coucher pour les patients SAOS léger à modéré.',
    instructions_fr: [
      'Placez la pointe de la langue contre le palais, derrière les incisives',
      'Expirez complètement par la bouche',
      'Inspirez silencieusement par le nez pendant 4 secondes',
      'Retenez le souffle pendant 7 secondes',
      'Expirez par la bouche avec un léger sifflement pendant 8 secondes',
      'Répétez 4 cycles — ne pas dépasser 4 cycles au début',
    ],
    metrics_tracked: ['cycles_completed'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    icon: '🌙',
  },

  // Relaxation
  {
    id: 'scan_corporel',
    category: 'relaxation',
    name_fr: 'Scan corporel pré-sommeil',
    duration_seconds: 600,
    difficulty: 1,
    description_fr:
      'Relaxation progressive de Jacobson adaptée — relâche les tensions musculaires segmentaires qui maintiennent le système nerveux en alerte.',
    instructions_fr: [
      'Allongez-vous confortablement, yeux fermés',
      'Respirez lentement par le nez — 3 cycles complets',
      'Concentrez-vous sur vos pieds — relâchez toute tension',
      'Remontez aux mollets et aux genoux — relâchez',
      'Remontez aux cuisses et aux hanches — relâchez',
      'Remontez au ventre et à la poitrine — respirez, relâchez',
      'Remontez aux épaules, aux bras, aux mains — relâchez',
      'Terminez par le visage : mâchoire, yeux, front — tout relâcher',
      'Restez immobile, observez le silence intérieur pendant 1 minute',
    ],
    metrics_tracked: ['duration_completed'],
    target_profile: [
      'adult_saos_mild',
      'adult_saos_severe',
      'adult_tmof',
      'adult_mixed',
    ],
    icon: '😌',
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
    label: 'Muscles orofaciaux',
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
    label: 'Respiration abdominale',
    icon: '🫁',
    color: 'teal',
  },
  {
    id: 'relaxation',
    label: 'Relaxation',
    icon: '😌',
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
  exercises: EXERCISES.filter((e) => e.category === f.id),
}));

// EXERCISES_BY_CATEGORY: used by Practice.tsx
export const EXERCISES_BY_CATEGORY: Record<ExerciseCategory, Exercise[]> = {
  pause_controlee: EXERCISES.filter((e) => e.category === 'pause_controlee'),
  coherence_cardiaque: EXERCISES.filter((e) => e.category === 'coherence_cardiaque'),
  respiration_nasale: EXERCISES.filter((e) => e.category === 'respiration_nasale'),
  myofonctionnel: EXERCISES.filter((e) => e.category === 'myofonctionnel'),
  diaphragmatique: EXERCISES.filter((e) => e.category === 'diaphragmatique'),
  relaxation: EXERCISES.filter((e) => e.category === 'relaxation'),
};

// PROGRAM_TEMPLATES: used by usePatientProgram
// Protocols enriched from Guimarães 2009, AirwayGym app RCT (2020), Pisoni 2024 overview
export const PROGRAM_TEMPLATES: Record<string, { exerciseIds: string[] }> = {
  adult_saos_mild: {
    exerciseIds: [
      'pause_decouverte',
      'coherence_5_5',
      'box_breathing',
      'langue_repos',
      'aspiration_langue',       // AirwayGym: IAH −53 %
      'tenue_levres',            // PMC5699856: IAH 12,2 → 3,9
      'elevation_voile_palais',  // Guimarães 2009: −50 % IAH
      'nasale_consciente',
      'respiration_diaphragmatique',
      'scan_corporel',
    ],
  },
  adult_saos_severe: {
    exerciseIds: [
      'coherence_5_5',
      'coherence_4_6',
      'respiration_478',
      'langue_repos',
      'aspiration_langue',       // AirwayGym: IAH −53 %
      'elevation_voile_palais',  // Guimarães 2009: −50 % IAH
      'tenue_levres',            // Fermeture buccale nocturne
      'gargarisme',              // Voile du palais vibration
      'nasale_consciente',
      'respiration_diaphragmatique',
      'scan_corporel',
    ],
  },
  adult_tmof: {
    exerciseIds: [
      'langue_repos',
      'claquement_langue',
      'aspiration_langue',
      'protrusion_langue',
      'balayage_palais',         // Guimarães 2009 protocol
      'tenue_levres',            // Orbicularis oris
      'elevation_voile_palais',  // Voile du palais
      'son_ah_tenu',
      'deglutition_correcte',
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
      'protrusion_langue',
      'aspiration_langue',
      'balayage_palais',         // Guimarães 2009
      'tenue_levres',            // Fermeture labiale
      'elevation_voile_palais',  // Voile du palais
      'nasale_consciente',
      'respiration_diaphragmatique',
      'scan_corporel',
    ],
  },
};
