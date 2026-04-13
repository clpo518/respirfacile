/**
 * Phoneme Profile Analysis
 * Identifies initial sounds (phonemes/digrams) where disfluencies occur most.
 * Helps clinicians spot trigger sounds (e.g., plosives /p/, /t/, /k/).
 * 
 * Uses simple letter/digram extraction — no complex phonetic transcription.
 */

import type { DisfluencyMarker } from "./analyzeDisfluency";

export interface PhonemeEntry {
  /** The initial sound (1–2 chars, lowercase) */
  phoneme: string;
  /** Number of disfluencies starting with this sound */
  count: number;
  /** Percentage of total disfluencies */
  percentage: number;
  /** Words that triggered disfluencies on this sound */
  examples: string[];
}

export interface PhonemeProfile {
  /** Top difficult sounds, sorted by frequency */
  topPhonemes: PhonemeEntry[];
  /** Total disfluencies analyzed */
  totalAnalyzed: number;
}

// French digrams that represent single sounds
const FRENCH_DIGRAMS = ['ch', 'ph', 'th', 'gn', 'qu', 'gu', 'ou', 'an', 'en', 'on', 'in', 'un', 'tr', 'pr', 'br', 'cr', 'dr', 'fr', 'gr', 'vr', 'bl', 'cl', 'fl', 'gl', 'pl'];

/**
 * Extract the initial phoneme/digram from a word
 */
function extractInitialSound(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿçœæ]/g, '');
  if (clean.length === 0) return '';
  
  // Check for digrams first
  if (clean.length >= 2) {
    const first2 = clean.substring(0, 2);
    if (FRENCH_DIGRAMS.includes(first2)) {
      return first2;
    }
  }
  
  return clean[0];
}

/**
 * Build a phoneme profile from disfluency markers
 */
export function getPhonemeProfile(markers: DisfluencyMarker[], maxTop: number = 3): PhonemeProfile {
  if (!markers || markers.length === 0) {
    return { topPhonemes: [], totalAnalyzed: 0 };
  }

  // Only analyze markers that have a word
  const withWords = markers.filter(m => m.word && m.word.trim().length > 0);
  
  const phonemeMap = new Map<string, { count: number; examples: Set<string> }>();
  
  for (const marker of withWords) {
    const sound = extractInitialSound(marker.word!);
    if (!sound) continue;
    
    const entry = phonemeMap.get(sound) || { count: 0, examples: new Set() };
    entry.count++;
    entry.examples.add(marker.word!.toLowerCase());
    phonemeMap.set(sound, entry);
  }

  const total = withWords.length;
  
  const topPhonemes: PhonemeEntry[] = Array.from(phonemeMap.entries())
    .map(([phoneme, data]) => ({
      phoneme,
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
      examples: Array.from(data.examples).slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTop);

  return { topPhonemes, totalAnalyzed: total };
}
