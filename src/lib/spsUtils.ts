/**
 * SPS (Syllables Per Second) Utility functions
 * Clinical standard for speech rate measurement in French
 * 
 * Conversion: ~1.8 syllables per French word on average
 * Clinical targets: 2.0-6.0 SPS (vs 120-200 WPM)
 */

import { countSyllables } from './syllabify';

// Maximum realistic SPS for a human speaker (~9 syllables/sec)
export const MAX_REALISTIC_SPS = 10.0;

// Rolling buffer size for smoothing
export const SPS_BUFFER_SIZE = 5;

// Convert WPM to SPS (for backward compatibility with old data)
export const wpmToSps = (wpm: number): number => {
  // Average French word has ~1.8 syllables
  // WPM * 1.8 = SPM (syllables per minute)
  // SPM / 60 = SPS (syllables per second)
  return Math.round((wpm * 1.8 / 60) * 10) / 10;
};

// Convert SPS to WPM (for display compatibility)
export const spsToWpm = (sps: number): number => {
  // SPS * 60 = SPM
  // SPM / 1.8 = WPM
  return Math.round(sps * 60 / 1.8);
};

/**
 * SPS Target Levels (Clinical Presets)
 */
export interface SPSTargetLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  sps: number;
  label: string;
  description: string;
  emoji: string;
  recommended?: boolean;
}

export const SPS_TARGET_LEVELS: SPSTargetLevel[] = [
  { level: 1, sps: 1.0, label: "Très posé", description: "Travail phonétique approfondi.", emoji: "🐌" },
  { level: 2, sps: 2.0, label: "Posé", description: "Hyper-contrôle. Travail d'articulation.", emoji: "🐢" },
  { level: 3, sps: 3.0, label: "Tranquille", description: "Rythme de dictée. Bon pour débuter.", emoji: "🎯" },
  { level: 4, sps: 4.0, label: "Modéré", description: "Conversation naturelle.", emoji: "💬", recommended: true },
  { level: 5, sps: 5.0, label: "Courant", description: "Débit courant.", emoji: "🗣️" },
  { level: 6, sps: 6.0, label: "Soutenu", description: "Débit soutenu.", emoji: "📢" },
  { level: 7, sps: 7.0, label: "Dynamique", description: "Rythme dynamique.", emoji: "💨" },
  { level: 8, sps: 8.0, label: "Vitesse haute", description: "Vitesse élevée.", emoji: "🔷" },
  { level: 9, sps: 9.0, label: "Très rapide", description: "Vitesse très élevée.", emoji: "🔶" },
];

/**
 * Get target level by SPS value
 */
export function getTargetLevelBySPS(sps: number): SPSTargetLevel {
  return SPS_TARGET_LEVELS.reduce((closest, level) => 
    Math.abs(level.sps - sps) < Math.abs(closest.sps - sps) ? level : closest
  );
}

/**
 * Smooth SPS calculation using a rolling buffer
 */
export function smoothSPS(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  
  // Filter out unrealistic spikes
  const validReadings = buffer.filter(sps => sps <= MAX_REALISTIC_SPS && sps >= 0);
  
  if (validReadings.length === 0) return 0;
  
  const sum = validReadings.reduce((a, b) => a + b, 0);
  return Math.round((sum / validReadings.length) * 10) / 10;
}

/**
 * Calculate max SPS with spike protection
 */
export function calculateSafeMaxSPS(history: number[]): number {
  if (history.length === 0) return 0;
  
  // Filter unrealistic values
  const validHistory = history.filter(sps => sps <= MAX_REALISTIC_SPS && sps > 0);
  
  if (validHistory.length === 0) return 0;
  
  // Find the highest value that appears at least 2 times in a 3-reading window
  let safeMax = 0;
  
  for (let i = 0; i < validHistory.length; i++) {
    const sps = validHistory[i];
    
    let sustainedCount = 1;
    const tolerance = 0.5; // 0.5 SPS tolerance
    
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (Math.abs(validHistory[j] - sps) <= tolerance) {
        sustainedCount++;
      }
    }
    
    for (let j = i + 1; j <= Math.min(validHistory.length - 1, i + 2); j++) {
      if (Math.abs(validHistory[j] - sps) <= tolerance) {
        sustainedCount++;
      }
    }
    
    if (sustainedCount >= 2 && sps > safeMax) {
      safeMax = sps;
    }
  }
  
  if (safeMax === 0) {
    safeMax = Math.max(...validHistory);
  }
  
  return Math.round(safeMax * 10) / 10;
}

/**
 * Adaptive thresholds: more forgiving for low targets (e.g. Tortue 2.0 syll/s).
 * Scale factor is >1 when target < 4, meaning bands widen.
 * Returns { good, bad } absolute diff thresholds.
 */
export function getAdaptiveThresholds(targetSps: number): { good: number; bad: number } {
  const scale = Math.max(1, 4.0 / targetSps);
  return {
    good: Math.round(0.3 * scale * 10) / 10,  // ±0.3 at target 4, ±0.6 at target 2
    bad: Math.round(1.0 * scale * 10) / 10,    // ±1.0 at target 4, ±2.0 at target 2
  };
}

/**
 * Get real-time feedback zone based on current vs target SPS
 */
export type SPSZone = 'perfect' | 'good' | 'warning' | 'danger' | 'too_slow' | 'waiting';

export function getSPSZone(currentSPS: number, targetSPS: number): {
  zone: SPSZone;
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (currentSPS === 0) {
    return { 
      zone: 'waiting', 
      label: "Parlez...", 
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted"
    };
  }
  
  // Proportional thresholds: target is a ceiling, not a bullseye
  const ratio = currentSPS / targetSPS;
  
  if (ratio < 0.5) {
    return { 
      zone: 'too_slow', 
      label: "Très posé", 
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-100 dark:bg-blue-900/30"
    };
  }
  
  if (ratio < 0.8) {
    return { 
      zone: 'good', 
      label: "Bien", 
      colorClass: "text-green-600 dark:text-green-400",
      bgClass: "bg-green-100 dark:bg-green-900/30"
    };
  }
  
  if (ratio <= 1.2) {
    return { 
      zone: 'perfect', 
      label: "Parfait", 
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-100 dark:bg-emerald-900/30"
    };
  }
  
  if (ratio <= 1.5) {
    return { 
      zone: 'warning', 
      label: "Doucement...", 
      colorClass: "text-orange-600 dark:text-orange-400",
      bgClass: "bg-orange-100 dark:bg-orange-900/30"
    };
  }
  
  return { 
    zone: 'danger', 
    label: "Trop vite !", 
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/30"
  };
}

/**
 * Get feedback interpretation based on average SPS
 */
export function getSpeedFeedback(avgSps: number, targetSps: number = 4.0): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  if (avgSps === 0) {
    return {
      title: "Session incomplète",
      description: "Aucune parole détectée.",
      emoji: "⏸️",
      colorClass: "text-muted-foreground"
    };
  }

  const diff = avgSps - targetSps;
  const { good, bad } = getAdaptiveThresholds(targetSps);

  if (diff >= -good && diff <= good) {
    return {
      title: "Objectif atteint",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/s est pile dans l'objectif de ${targetSps.toFixed(1)} syll/s. Bravo !`,
      emoji: "✨",
      colorClass: "text-green-600"
    };
  }

  if (diff > good && diff <= bad) {
    return {
      title: "Légèrement au-dessus",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/s dépasse l'objectif de ${targetSps.toFixed(1)} syll/s. Pensez à marquer davantage les pauses.`,
      emoji: "⚡",
      colorClass: "text-orange-600"
    };
  }

  if (diff > bad) {
    return {
      title: "Débit trop rapide",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/s est bien au-dessus de l'objectif de ${targetSps.toFixed(1)} syll/s. Essayez de ralentir.`,
      emoji: "🔴",
      colorClass: "text-red-600"
    };
  }

  if (diff < -good && diff >= -bad) {
    return {
      title: "Bien contrôlé",
      description: `Votre débit de ${avgSps.toFixed(1)} syll/s est légèrement sous l'objectif. Vous maîtrisez bien votre rythme.`,
      emoji: "🐢",
      colorClass: "text-emerald-600"
    };
  }

  // diff < -bad
  return {
    title: "Régime très lent",
    description: `Votre débit de ${avgSps.toFixed(1)} syll/s est très en-dessous de l'objectif de ${targetSps.toFixed(1)} syll/s. Vous pouvez accélérer progressivement.`,
    emoji: "🐢",
    colorClass: "text-blue-600"
  };
}

/**
 * Calculate syllables from text and elapsed time to get SPS
 */
export function calculateSPSFromText(text: string, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const syllables = countSyllables(text);
  return Math.round((syllables / elapsedSeconds) * 10) / 10;
}

/**
 * Format SPS for display
 */
export function formatSPS(sps: number): string {
  return sps.toFixed(1);
}

/**
 * Clinical thresholds for SPS
 */
export const SPS_THRESHOLDS = {
  optimal: 5.0,    // Target zone center
  elevated: 6.0,   // Getting fast
  tachylalia: 7.0, // Clinical concern
} as const;

/**
 * Returns a clinical status label based on average SPS
 */
export function getDebitStatus(avgSps: number): {
  label: string;
  shortLabel: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  if (avgSps === 0) {
    return { label: "Non mesuré", shortLabel: "—", color: "gray" };
  }
  if (avgSps < 3.5) {
    return { label: "Débit lent", shortLabel: "Lent", color: "green" };
  }
  if (avgSps <= 5.5) {
    return { label: "Débit normo-fluent", shortLabel: "Normo-fluent", color: "green" };
  }
  if (avgSps <= 6.5) {
    return { label: "Débit rapide", shortLabel: "Rapide", color: "yellow" };
  }
  return { label: "Tachylalie", shortLabel: "Tachylalie", color: "red" };
}
