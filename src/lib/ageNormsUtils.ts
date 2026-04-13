/**
 * Age-Based SPS Norms (Van Zaalen)
 * Clinical speech rate calibration based on age groups
 * 
 * Reference: Van Zaalen, Y., Wijnen, F., & Dejonckere, P. H.
 */

// Age group definitions
export type AgeGroup = 'child' | 'adolescent' | 'adult' | 'senior';

export interface AgeNorm {
  group: AgeGroup;
  label: string;
  emoji: string;
  minAge: number;
  maxAge: number;
  normSPS: number;
  description: string;
}

// Van Zaalen clinical norms for articulation rate
export const AGE_NORMS: AgeNorm[] = [
  {
    group: 'child',
    label: 'Enfant',
    emoji: '👶',
    minAge: 0,
    maxAge: 12,
    normSPS: 4.2,
    description: 'Développement du débit articulatoire'
  },
  {
    group: 'adolescent',
    label: 'Adolescent',
    emoji: '🧑',
    minAge: 13,
    maxAge: 20,
    normSPS: 5.5,
    description: 'Pic de vitesse physiologique'
  },
  {
    group: 'adult',
    label: 'Adulte',
    emoji: '👤',
    minAge: 21,
    maxAge: 60,
    normSPS: 5.0,
    description: 'Débit stabilisé'
  },
  {
    group: 'senior',
    label: 'Senior',
    emoji: '🧓',
    minAge: 61,
    maxAge: 120,
    normSPS: 4.5,
    description: 'Ralentissement physiologique naturel'
  }
];

// Default norm for fallback (adult)
export const DEFAULT_NORM_SPS = 5.0;

/**
 * Calculate age from birth year
 */
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * Get the appropriate age group for a given birth year
 */
export function getAgeGroup(birthYear: number | null): AgeNorm {
  if (!birthYear) {
    return AGE_NORMS.find(n => n.group === 'adult')!;
  }
  
  const age = calculateAge(birthYear);
  
  for (const norm of AGE_NORMS) {
    if (age >= norm.minAge && age <= norm.maxAge) {
      return norm;
    }
  }
  
  // Fallback to adult
  return AGE_NORMS.find(n => n.group === 'adult')!;
}

/**
 * Get the clinical norm SPS for a given birth year
 * This is the center of the "green zone" for the user
 */
export function getNormSPS(birthYear: number | null): number {
  const ageGroup = getAgeGroup(birthYear);
  return ageGroup.normSPS;
}

/**
 * Get the age group label for display
 */
export function getAgeGroupLabel(birthYear: number | null): string {
  const ageGroup = getAgeGroup(birthYear);
  return ageGroup.label;
}

/**
 * Dynamic level interface for calibrated targets
 */
export interface DynamicSPSLevel {
  level: number;
  sps: number;
  label: string;
  description: string;
  emoji: string;
  recommended: boolean;
  isAboveNorm: boolean;
}

/**
 * Generate 5 dynamic levels centered on the user's norm SPS
 * Level 3 is always the recommended level (the norm)
 */
export function getDynamicLevels(normSPS: number): DynamicSPSLevel[] {
  const LEVEL_CONFIG: { label: string; emoji: string; description: string }[] = [
    { label: "Très posé", emoji: "🐌", description: "Travail phonétique approfondi." },
    { label: "Posé", emoji: "🐢", description: "Hyper-contrôle." },
    { label: "Tranquille", emoji: "🎯", description: "Rythme de dictée." },
    { label: "Modéré", emoji: "💬", description: "Conversation naturelle." },
    { label: "Courant", emoji: "🗣️", description: "Débit courant." },
    { label: "Soutenu", emoji: "📢", description: "Débit soutenu." },
    { label: "Dynamique", emoji: "💨", description: "Rythme dynamique." },
    { label: "Vitesse haute", emoji: "🔷", description: "Vitesse élevée." },
    { label: "Très rapide", emoji: "🔶", description: "Vitesse très élevée." },
  ];
  
  return LEVEL_CONFIG.map((config, i) => {
    const sps = i + 1;
    const isNorm = Math.abs(sps - normSPS) < 0.5;
    return {
      level: sps,
      sps,
      label: isNorm ? "Recommandé" : config.label,
      description: isNorm ? "Votre norme clinique." : config.description,
      emoji: isNorm ? "✅" : config.emoji,
      recommended: isNorm,
      isAboveNorm: sps > normSPS + 0.5,
    };
  });
}

/**
 * Extended 6-level system (1 to 6 SPS, for advanced mode)
 */
export function getExtendedLevels(normSPS: number): DynamicSPSLevel[] {
  return getDynamicLevels(normSPS);
}

/**
 * Check if a selected SPS exceeds the safe threshold above the user's norm
 */
export function isAboveSafeThreshold(selectedSPS: number, normSPS: number): boolean {
  return selectedSPS > normSPS + 1.5;
}

/**
 * Get a warning message for selections above the safe threshold
 */
export function getAboveNormWarning(selectedSPS: number, normSPS: number, ageGroupLabel: string): string | null {
  if (!isAboveSafeThreshold(selectedSPS, normSPS)) {
    return null;
  }
  
  const diff = Math.round((selectedSPS - normSPS) * 10) / 10;
  return `Ce niveau dépasse de ${diff} syll/sec la norme physiologique ${ageGroupLabel.toLowerCase()}. Augmentez progressivement.`;
}

/**
 * Validate birth year input
 */
export function validateBirthYear(year: number): { valid: boolean; error?: string } {
  const currentYear = new Date().getFullYear();
  const minYear = 1920;
  const maxYear = currentYear - 5; // Minimum 5 years old
  
  if (!Number.isInteger(year)) {
    return { valid: false, error: "L'année doit être un nombre entier" };
  }
  
  if (year < minYear) {
    return { valid: false, error: `L'année doit être après ${minYear}` };
  }
  
  if (year > maxYear) {
    return { valid: false, error: `L'année doit être avant ${maxYear}` };
  }
  
  return { valid: true };
}
