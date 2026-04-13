/**
 * Speech Regularity Score
 * Measures how regular/steady the speech rhythm is using
 * the Coefficient of Variation (CV) of inter-word durations.
 * 
 * CV = standard deviation / mean
 * - CV < 0.8 → Regular speech (natural variability)
 * - CV 0.8–1.3 → Variable speech
 * - CV > 1.3 → Irregular speech (stuttering pattern)
 */

import type { WordTimestamp } from "./analyzeDisfluency";

export type RegularityLevel = 'regular' | 'variable' | 'irregular';

export interface RegularityScore {
  /** Coefficient of Variation (0 = perfectly regular) */
  cv: number;
  /** Clinical level */
  level: RegularityLevel;
  /** Display label */
  label: string;
  /** Emoji */
  emoji: string;
  /** Color class for UI */
  colorClass: string;
  /** Background class for UI */
  bgClass: string;
  /** Mean inter-word gap in seconds */
  meanGap: number;
  /** Standard deviation of inter-word gaps */
  stdGap: number;
}

/**
 * Calculate regularity score from word timestamps
 */
export function calculateRegularityScore(words: WordTimestamp[]): RegularityScore | null {
  if (!words || words.length < 5) return null; // Need enough words for meaningful stats

  // Calculate inter-word gaps (only between consecutive spoken words)
  const gaps: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    // Only include reasonable gaps (exclude long pauses > 3s which are breaks, not rhythm)
    if (gap >= 0 && gap < 3.0) {
      gaps.push(gap);
    }
  }

  if (gaps.length < 3) return null;

  // Calculate mean
  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  if (mean === 0) return null;

  // Calculate standard deviation
  const variance = gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length;
  const std = Math.sqrt(variance);

  // Coefficient of Variation
  const cv = Math.round((std / mean) * 100) / 100;

  let level: RegularityLevel;
  let label: string;
  let emoji: string;
  let colorClass: string;
  let bgClass: string;

  if (cv < 0.8) {
    level = 'regular';
    label = 'Régulier';
    emoji = '🟢';
    colorClass = 'text-emerald-600';
    bgClass = 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
  } else if (cv < 1.3) {
    level = 'variable';
    label = 'Variable';
    emoji = '🟡';
    colorClass = 'text-yellow-600';
    bgClass = 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
  } else {
    level = 'irregular';
    label = 'Irrégulier';
    emoji = '🔴';
    colorClass = 'text-red-600';
    bgClass = 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  }

  return {
    cv,
    level,
    label,
    emoji,
    colorClass,
    bgClass,
    meanGap: Math.round(mean * 1000) / 1000,
    stdGap: Math.round(std * 1000) / 1000,
  };
}
