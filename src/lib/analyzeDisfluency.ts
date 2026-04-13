/**
 * Disfluency Analysis Module
 * Detects stuttering markers: repetitions, prolongations, and blocks
 * Based on acoustic analysis of word timestamps from Deepgram
 */

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  duration: number;
  syllables?: number;
  isFiller?: boolean;
  fillerKey?: string;
}

export type DisfluencyType = 'repetition' | 'prolongation' | 'block' | 'syllabic_repetition';
export type DisfluencySeverity = 'mild' | 'moderate' | 'severe';

export interface DisfluencyMarker {
  type: DisfluencyType;
  wordIndex: number;
  severity: DisfluencySeverity;
  duration?: number;  // For blocks and prolongations
  word?: string;      // The affected word
  count?: number;     // For repetitions: how many times the word is repeated consecutively
}

export interface DisfluencySummary {
  repetitions: number;
  prolongations: number;
  blocks: number;
  total: number;
}

export type FluencySeverityLevel = 'fluent' | 'mild' | 'moderate' | 'severe';

export interface FluencyScore {
  /** Percentage of disfluent words (disfluency markers / total words * 100) */
  disfluencyPercentage: number;
  /** Clinical severity level based on percentage */
  severityLevel: FluencySeverityLevel;
  /** Human-readable label */
  severityLabel: string;
  /** Color class for UI */
  severityColor: string;
  /** Total word count used for calculation */
  totalWords: number;
}

export interface DisfluencyAnalysis {
  markers: DisfluencyMarker[];
  summary: DisfluencySummary;
}

// Configuration thresholds
const THRESHOLDS = {
  // Repetition: same word repeated with gap < 0.2s
  REPETITION_GAP_MAX: 0.2,
  
  // Prolongation: word duration > 0.8s on short words (< 8 chars)
  PROLONGATION_DURATION_MIN: 0.8,
  PROLONGATION_WORD_LENGTH_MAX: 8,
  PROLONGATION_SEVERE_DURATION: 1.5,
  
  // Block: silence > 3.0s without punctuation before (raised from 2.0 to reduce false positives)
  BLOCK_SILENCE_MIN: 3.0,
  BLOCK_SEVERE_SILENCE: 5.0,
};

// Punctuation that indicates natural pauses
const PAUSE_PUNCTUATION = /[.,!?;:…—–-]$/;

/**
 * Analyze word timestamps for disfluency markers
 */
export function analyzeDisfluency(words: WordTimestamp[]): DisfluencyAnalysis {
  const markers: DisfluencyMarker[] = [];
  
  if (!words || words.length === 0) {
    return {
      markers: [],
      summary: { repetitions: 0, prolongations: 0, blocks: 0, total: 0 }
    };
  }
  
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const previous = i > 0 ? words[i - 1] : null;
    const next = i < words.length - 1 ? words[i + 1] : null;
    
    // Normalize word for comparison
    const normalizedWord = current.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
    
    // 1. Check for REPETITIONS (Clonic stuttering)
    // Same word repeated rapidly (gap < 0.2s)
    // Count consecutive repetitions
    if (next) {
      const nextNormalized = next.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
      const gap = next.start - current.end;
      
      if (normalizedWord === nextNormalized && gap >= 0 && gap < THRESHOLDS.REPETITION_GAP_MAX) {
        // Only mark the first occurrence of the repetition
        const alreadyMarked = markers.some(
          m => m.type === 'repetition' && m.wordIndex === i
        );
        if (!alreadyMarked) {
          // Count how many times this word repeats consecutively
          let repCount = 2; // at least current + next
          let j = i + 2;
          while (j < words.length) {
            const jNormalized = words[j].word.toLowerCase().replace(/[.,!?;:'"]/g, '');
            const jGap = words[j].start - words[j - 1].end;
            if (jNormalized === normalizedWord && jGap >= 0 && jGap < THRESHOLDS.REPETITION_GAP_MAX) {
              repCount++;
              j++;
            } else {
              break;
            }
          }
          
          markers.push({
            type: 'repetition',
            wordIndex: i,
            severity: repCount >= 4 ? 'severe' : repCount >= 3 ? 'moderate' : 'mild',
            word: current.word,
            count: repCount,
          });
        }
      }
      
      // 1b. Check for SYLLABIC REPETITIONS (partial word repetitions)
      // e.g., "pa-pa-papa", "je-je-je suis" — first word is a truncated prefix of the next
      if (
        normalizedWord !== nextNormalized &&
        normalizedWord.length >= 2 &&
        nextNormalized.length > normalizedWord.length &&
        nextNormalized.startsWith(normalizedWord) &&
        gap >= 0 && gap < THRESHOLDS.REPETITION_GAP_MAX
      ) {
        markers.push({
          type: 'syllabic_repetition',
          wordIndex: i,
          severity: 'mild',
          word: current.word,
        });
      }
    }
    
    // 2. Check for PROLONGATIONS (Tonic stuttering)
    // Duration > 0.8s on short words
    if (
      current.duration > THRESHOLDS.PROLONGATION_DURATION_MIN &&
      normalizedWord.length < THRESHOLDS.PROLONGATION_WORD_LENGTH_MAX
    ) {
      const severity: DisfluencySeverity = 
        current.duration >= THRESHOLDS.PROLONGATION_SEVERE_DURATION ? 'severe' : 
        current.duration >= 1.0 ? 'moderate' : 'mild';
      
      markers.push({
        type: 'prolongation',
        wordIndex: i,
        severity,
        duration: current.duration,
        word: current.word
      });
    }
    
    // 3. Check for BLOCKS (Silent blocks)
    // Silence > 3.0s without punctuation before
    if (previous) {
      const silence = current.start - previous.end;
      
      // Only flag as block if previous word didn't end with punctuation
      // (punctuation indicates natural pause, not a block)
      const hasPunctuationBefore = PAUSE_PUNCTUATION.test(previous.word);
      
      // Heuristic: detect implicit end-of-sentence (last word is short common sentence-ender)
      const SENTENCE_ENDERS = /^(alors|donc|voilà|quoi|bien|bon|oui|non|merci|aussi|enfin)$/i;
      const isImplicitEndOfSentence = SENTENCE_ENDERS.test(
        previous.word.toLowerCase().replace(/[.,!?;:'"]/g, '')
      );
      
      // Skip if punctuation or implicit sentence break
      if (silence >= THRESHOLDS.BLOCK_SILENCE_MIN && !hasPunctuationBefore && !isImplicitEndOfSentence) {
        const severity: DisfluencySeverity = 
          silence >= THRESHOLDS.BLOCK_SEVERE_SILENCE ? 'severe' : 
          silence >= 4.0 ? 'moderate' : 'mild';
        
        markers.push({
          type: 'block',
          wordIndex: i,
          severity,
          duration: silence,
          word: current.word // The word that came after the block
        });
      }
    }
  }
  
  // Calculate summary
  const summary: DisfluencySummary = {
    repetitions: markers.filter(m => m.type === 'repetition').length,
    prolongations: markers.filter(m => m.type === 'prolongation').length,
    blocks: markers.filter(m => m.type === 'block').length,
    total: markers.length
  };
  
  return { markers, summary };
}

/**
 * Get human-readable label for disfluency type
 */
export function getDisfluencyLabel(type: DisfluencyType): string {
  switch (type) {
    case 'repetition':
      return 'Répétition';
    case 'syllabic_repetition':
      return 'Répétition syllabique';
    case 'prolongation':
      return 'Allongement';
    case 'block':
      return 'Pause longue';
    default:
      return type;
  }
}

/**
 * Get emoji for disfluency type
 */
export function getDisfluencyEmoji(type: DisfluencyType): string {
  switch (type) {
    case 'repetition':
      return '🟡';
    case 'syllabic_repetition':
      return '🟤';
    case 'prolongation':
      return '🟣';
    case 'block':
      return '🟠';
    default:
      return '⚪';
  }
}

/**
 * Get CSS classes for disfluency highlighting
 */
export function getDisfluencyStyles(type: DisfluencyType): {
  className: string;
  description: string;
} {
  switch (type) {
    case 'repetition':
      return {
        className: 'underline decoration-yellow-400 decoration-2 underline-offset-4 bg-yellow-50',
        description: 'Mot répété rapidement'
      };
    case 'prolongation':
      return {
        className: 'bg-purple-100 text-purple-900 rounded px-1',
        description: 'Durée anormalement longue'
      };
    case 'syllabic_repetition':
      return {
        className: 'underline decoration-dashed decoration-amber-500 decoration-2 underline-offset-2 bg-amber-50',
        description: 'Syllabe répétée (mot tronqué)'
      };
    case 'block':
      return {
        className: 'border-l-4 border-orange-400 pl-2 ml-1',
        description: 'Silence > 2s entre deux mots'
      };
    default:
      return {
        className: '',
        description: ''
      };
  }
}

/**
 * Burst Detection: identifies segments where SPS stays above target for > minDuration seconds
 * Used to highlight cluttering/tachylalia episodes on the SPS chart
 */
export interface BurstZone {
  startTime: number;
  endTime: number;
  avgSps: number;
}

export function detectBursts(
  wpmData: { timestamp: number; wpm: number }[],
  targetSps: number,
  minDurationSec: number = 3,
  wpmToSpsFn: (wpm: number) => number = (wpm) => Math.round((wpm * 1.8 / 60) * 10) / 10,
): BurstZone[] {
  if (!wpmData || wpmData.length < 2 || targetSps <= 0) return [];

  const bursts: BurstZone[] = [];
  let burstStart: number | null = null;
  let burstSpsSum = 0;
  let burstCount = 0;

  for (let i = 0; i < wpmData.length; i++) {
    const sps = wpmToSpsFn(wpmData[i].wpm);
    const time = wpmData[i].timestamp;

    if (sps > targetSps * 1.2) {
      // Above threshold
      if (burstStart === null) {
        burstStart = time;
        burstSpsSum = sps;
        burstCount = 1;
      } else {
        burstSpsSum += sps;
        burstCount++;
      }
    } else {
      // Below threshold — close any open burst
      if (burstStart !== null) {
        const burstEnd = wpmData[i - 1]?.timestamp ?? time;
        const duration = burstEnd - burstStart;
        if (duration >= minDurationSec) {
          bursts.push({
            startTime: burstStart,
            endTime: burstEnd,
            avgSps: Math.round((burstSpsSum / burstCount) * 10) / 10,
          });
        }
        burstStart = null;
        burstSpsSum = 0;
        burstCount = 0;
      }
    }
  }

  // Close trailing burst
  if (burstStart !== null) {
    const burstEnd = wpmData[wpmData.length - 1].timestamp;
    const duration = burstEnd - burstStart;
    if (duration >= minDurationSec) {
      bursts.push({
        startTime: burstStart,
        endTime: burstEnd,
        avgSps: Math.round((burstSpsSum / burstCount) * 10) / 10,
      });
    }
  }

  return bursts;
}

/**
 * Calculate fluency score: % of disfluencies and clinical severity
 * Based on standard clinical thresholds:
 * - < 3% = fluent
 * - 3-10% = mild (léger)
 * - 10-20% = moderate (modéré)
 * - > 20% = severe (sévère)
 */
export function calculateFluencyScore(
  words: WordTimestamp[],
  analysis: DisfluencyAnalysis
): FluencyScore {
  const totalWords = words.filter(w => !w.isFiller).length;
  
  if (totalWords === 0) {
    return {
      disfluencyPercentage: 0,
      severityLevel: 'fluent',
      severityLabel: 'Fluent',
      severityColor: 'text-green-600',
      totalWords: 0,
    };
  }

  // Count unique disfluent word indices (a word can have multiple markers)
  const disfluencyCount = analysis.summary.total;
  // Also count fillers
  const fillerCount = words.filter(w => w.isFiller).length;
  
  const totalDisfluencies = disfluencyCount + fillerCount;
  const totalTokens = words.length;
  const percentage = Math.round((totalDisfluencies / totalTokens) * 1000) / 10;

  let severityLevel: FluencySeverityLevel;
  let severityLabel: string;
  let severityColor: string;

  if (percentage < 3) {
    severityLevel = 'fluent';
    severityLabel = 'Fluent';
    severityColor = 'text-green-600';
  } else if (percentage < 10) {
    severityLevel = 'mild';
    severityLabel = 'Léger';
    severityColor = 'text-yellow-600';
  } else if (percentage < 20) {
    severityLevel = 'moderate';
    severityLabel = 'Modéré';
    severityColor = 'text-orange-600';
  } else {
    severityLevel = 'severe';
    severityLabel = 'Sévère';
    severityColor = 'text-red-600';
  }

  return {
    disfluencyPercentage: percentage,
    severityLevel,
    severityLabel,
    severityColor,
    totalWords: totalTokens,
  };
}
