/**
 * French Syllabification Utility
 * Based on clinical speech therapy methods for cluttering (bredouillement)
 * 
 * This provides a heuristic approach to splitting French words into syllables
 * for the "Conscience Syllabique" (Syllable Awareness) mode.
 */

import { SYLLABLE_DICTIONARY } from './syllableDictionary';

// French vowels (including accented)
const VOWELS = 'aeiouyàâäéèêëïîôùûüœæ';
const VOWELS_REGEX = new RegExp(`[${VOWELS}]`, 'gi');

// Common French consonant clusters that shouldn't be split
const CONSONANT_CLUSTERS = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'ph', 'pl', 'pr', 'qu', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'th', 'tr', 'vr', 'wr'];

/**
 * Count syllables using dictionary lookup + improved heuristic fallback
 * Optimized for single word counting (used by useDeepgramSPS)
 */
export function countSyllablesWord(word: string): number {
  // Strip punctuation but KEEP hyphens and apostrophes for compound words
  const normalized = word.toLowerCase().trim().replace(/[.,!?;:'"«»()\[\]{}…–—]/g, '');
  if (!normalized) return 0;
  
  // 1. Dictionary lookup first (exact match, including hyphenated compounds like "est-ce")
  if (SYLLABLE_DICTIONARY[normalized] !== undefined) {
    return SYLLABLE_DICTIONARY[normalized];
  }
  
  // 2. For hyphenated words not in dictionary, sum parts
  if (normalized.includes('-')) {
    const parts = normalized.split('-').filter(p => p.length > 0);
    if (parts.length > 1) {
      let total = 0;
      for (const part of parts) {
        total += SYLLABLE_DICTIONARY[part] ?? countSyllablesHeuristic(part);
      }
      return Math.max(1, total);
    }
  }
  
  // 3. Check for contractions with apostrophe
  if (normalized.includes("'")) {
    const parts = normalized.split("'");
    if (SYLLABLE_DICTIONARY[normalized] !== undefined) {
      return SYLLABLE_DICTIONARY[normalized];
    }
    // Sum syllables of parts
    let total = 0;
    for (const part of parts) {
      if (part.length > 0) {
        total += SYLLABLE_DICTIONARY[part] ?? countSyllablesHeuristic(part);
      }
    }
    return Math.max(1, total);
  }
  
  // 3. Heuristic fallback
  return countSyllablesHeuristic(normalized);
}

/**
 * Improved heuristic for French syllable counting
 * Handles silent 'e', 'es', 'ent' endings
 */
function countSyllablesHeuristic(word: string): number {
  if (word.length === 0) return 0;
  if (word.length <= 2) return 1;
  
  // Count vowel groups (diphtongues like 'au', 'eau', 'oi', 'ou' = 1)
  const vowelGroups = word.match(/[aeiouyàâäéèêëïîôùûüœæ]+/gi) || [];
  let count = vowelGroups.length;
  
  // Handle silent 'e' at end of word (after consonant)
  // Ex: "table" = 1, "pomme" = 1, "libre" = 1
  if (word.length > 2 && word.endsWith('e')) {
    const beforeE = word.slice(-2, -1);
    if (!/[aeiouyàâäéèêëïîôùûüœæ]/i.test(beforeE)) {
      count = Math.max(1, count - 1);
    }
  }
  
  // Handle silent 'es' at end of word (after consonant)
  // Ex: "tables" = 1, "pommes" = 1
  if (word.length > 3 && word.endsWith('es')) {
    const beforeEs = word.slice(-3, -2);
    if (!/[aeiouyàâäéèêëïîôùûüœæ]/i.test(beforeEs)) {
      count = Math.max(1, count - 1);
    }
  }
  
  // Handle silent 'ent' at end (3rd person plural conjugation)
  // Ex: "parlent" = 1, "mangent" = 1, "aiment" = 1
  // But NOT: "content" = 2, "parent" = 2 (nouns/adjectives)
  if (word.length > 4 && word.endsWith('ent')) {
    const beforeEnt = word.slice(-4, -3);
    // Only subtract if preceded by vowel (likely verb conjugation)
    if (/[aeiouyàâäéèêëïîôùûüœæ]/i.test(beforeEnt)) {
      count = Math.max(1, count - 1);
    }
  }
  
  return Math.max(1, count);
}

/**
 * Simple French syllabification algorithm
 * Uses the principle: split after vowels, keeping consonant clusters together
 */
export function syllabifyWord(word: string): string[] {
  if (!word || word.length <= 2) return [word];
  
  const lowerWord = word.toLowerCase();
  const syllables: string[] = [];
  let currentSyllable = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const lowerChar = lowerWord[i];
    currentSyllable += char;
    
    // Check if current char is a vowel
    if (VOWELS.includes(lowerChar)) {
      // Look ahead to see if we should split
      const remaining = lowerWord.slice(i + 1);
      
      if (remaining.length === 0) {
        // End of word, keep the syllable
        continue;
      }
      
      // Count consonants before next vowel
      let consonantCount = 0;
      for (let j = 0; j < remaining.length; j++) {
        if (VOWELS.includes(remaining[j])) break;
        consonantCount++;
      }
      
      if (consonantCount === 0) {
        // Two vowels in a row - might be a diphthong, don't split
        continue;
      } else if (consonantCount === 1) {
        // Single consonant goes to next syllable
        syllables.push(currentSyllable);
        currentSyllable = '';
      } else if (consonantCount >= 2) {
        // Check for consonant clusters
        const nextTwo = remaining.slice(0, 2).toLowerCase();
        if (CONSONANT_CLUSTERS.includes(nextTwo)) {
          // Cluster stays together with next syllable
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else {
          // Split between consonants: first consonant stays, rest go to next
          const nextChar = word[i + 1];
          syllables.push(currentSyllable + nextChar);
          currentSyllable = '';
          i++; // Skip the consonant we just added
        }
      }
    }
  }
  
  // Add remaining syllable
  if (currentSyllable) {
    // If we only have consonants left, append to last syllable
    if (syllables.length > 0 && !VOWELS_REGEX.test(currentSyllable)) {
      syllables[syllables.length - 1] += currentSyllable;
    } else {
      syllables.push(currentSyllable);
    }
  }
  
  // Clean up: merge very short syllables
  const cleaned: string[] = [];
  for (let i = 0; i < syllables.length; i++) {
    const syl = syllables[i];
    if (syl.length === 1 && !VOWELS.includes(syl.toLowerCase()) && cleaned.length > 0) {
      cleaned[cleaned.length - 1] += syl;
    } else if (syl.length === 1 && cleaned.length > 0 && i < syllables.length - 1) {
      // Single vowel - attach to next syllable
      syllables[i + 1] = syl + syllables[i + 1];
    } else {
      cleaned.push(syl);
    }
  }
  
  // Post-processing: merge silent final segments (e muet)
  // Handles -e, -es, -ent (verbal) endings that are silent in spoken French
  const result = cleaned.length > 0 ? cleaned : [word];
  if (result.length >= 2) {
    const lastSeg = result[result.length - 1];
    const lastSegClean = lastSeg.toLowerCase().replace(/[.,!?;:…\-–—'"»)\]]/g, '');
    // Check if the last segment is a silent ending (no accented vowels, just consonants + e/es/ent)
    const isSilentEnding = /^[^aeiouyàâäéèêëïîôùûüœæ]*e(s|nt)?$/i.test(lastSegClean);
    if (isSilentEnding) {
      result[result.length - 2] += result[result.length - 1];
      result.pop();
    }
  }
  return result.length > 0 ? result : [word];
}

/**
 * Syllabify an entire sentence
 * Returns an array of { word: string, syllables: string[] }
 */
export interface SyllabifiedWord {
  original: string;
  syllables: string[];
  isPunctuation: boolean;
}

export function syllabifySentence(sentence: string): SyllabifiedWord[] {
  // Split by spaces while preserving punctuation attached to words
  const tokens = sentence.split(/\s+/).filter(t => t.length > 0);
  
  return tokens.map(token => {
    // Check if it's just punctuation
    if (/^[.,!?;:…\-–—'"«»()[\]{}]+$/.test(token)) {
      return { original: token, syllables: [token], isPunctuation: true };
    }
    
    // Extract trailing punctuation
    const match = token.match(/^(.+?)([.,!?;:…\-–—'"»)\]]*)?$/);
    if (!match) return { original: token, syllables: [token], isPunctuation: false };
    
    const [, word, punctuation] = match;
    const syllables = syllabifyWord(word);
    
    // Add punctuation to last syllable if present
    if (punctuation && syllables.length > 0) {
      syllables[syllables.length - 1] += punctuation;
    }
    
    return { original: token, syllables, isPunctuation: false };
  });
}

/**
 * Get total syllable count for a sentence (using improved dictionary + heuristic)
 */
export function countSyllables(sentence: string): number {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  let total = 0;
  
  for (const word of words) {
    // Skip pure punctuation
    if (/^[.,!?;:…\-–—'"«»()[\]{}]+$/.test(word)) continue;
    
    total += countSyllablesWord(word);
  }
  
  return total;
}
