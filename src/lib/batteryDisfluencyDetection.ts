/**
 * Auto-détection des disfluences pour le bilan bredouillement
 * 
 * Pipeline : Audio blob → Deepgram REST API → Word timestamps → 
 * analyzeDisfluency + speechRateTimeline + syllabify + clutteringProfile →
 * Mapping vers les catégories Van Zaalen (8 types)
 * 
 * Utilise le MÊME moteur d'analyse que le reste du site :
 * - syllabify.ts pour le comptage syllabique précis
 * - speechRateTimeline.ts pour la VA par fenêtre glissante (parole effective)
 * - clutteringProfile.ts pour le scoring de sévérité
 * - analyzeDisfluency.ts pour la détection des disfluences
 */
import { supabase } from "@/integrations/supabase/client";
import { analyzeDisfluency, type WordTimestamp } from "./analyzeDisfluency";
import { DISFLUENCY_TYPES } from "@/data/batteryNorms";
import { countSyllablesWord } from "./syllabify";
import { buildSpeechRateTimeline, computeSpeechRateMetrics } from "./speechRateTimeline";
import { analyzeClutteringProfile, type ClutteringProfile } from "./clutteringProfile";

export interface BatteryDisfluencyResult {
  /** Disfluency counts mapped to battery categories (Van Zaalen) */
  disfluencyDetails: Record<string, number>;
  /** Word timestamps for further analysis */
  wordTimestamps: WordTimestamp[];
  /** Total syllable count (via syllabify.ts) */
  syllableCount: number;
  /** Raw transcript text */
  transcript: string;
  /** Articulation rate (SPS) computed via speechRateTimeline (speech-only time) */
  articulationRate: number;
  /** 5 VA samples extracted from timeline segments */
  vaSamples: number[];
  /** VA variability (max - min of samples) */
  vaVariability: number;
  /** Cluttering profile from the unified engine */
  clutteringProfile: ClutteringProfile | null;
}

// French filler words (interjections)
const FILLER_WORDS = new Set([
  'euh', 'heu', 'hum', 'ben', 'bah', 'bon', 'genre', 'alors', 'voilà', 'quoi', 'e',
  'enfin', 'donc',
]);

/**
 * Extract 5 evenly-spaced VA samples from speech rate timeline
 */
function extractVASamples(words: WordTimestamp[], totalDuration: number): { samples: number[]; avgRate: number; variability: number } {
  const timeline = buildSpeechRateTimeline(words, { duration: totalDuration });
  
  if (timeline.length === 0) {
    return { samples: [0, 0, 0, 0, 0], avgRate: 0, variability: 0 };
  }

  // Divide timeline into 5 equal segments and take the median SPS of each
  const segmentSize = Math.max(1, Math.floor(timeline.length / 5));
  const samples: number[] = [];
  
  for (let i = 0; i < 5; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, timeline.length);
    const segment = timeline.slice(start, end);
    
    if (segment.length === 0) {
      samples.push(0);
      continue;
    }
    
    // Use median for robustness
    const sorted = segment.map(s => s.sps).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    samples.push(Math.round(median * 100) / 100);
  }

  const nonZero = samples.filter(s => s > 0);
  const avgRate = nonZero.length > 0
    ? Math.round((nonZero.reduce((a, b) => a + b, 0) / nonZero.length) * 100) / 100
    : 0;
  const variability = nonZero.length > 1
    ? Math.round((Math.max(...nonZero) - Math.min(...nonZero)) * 100) / 100
    : 0;

  return { samples, avgRate, variability };
}

/**
 * Compute overall articulation rate using speechRateTimeline engine
 * (syllables / speech-only time, excluding pauses)
 */
function computeArticulationRate(words: WordTimestamp[]): number {
  if (words.length === 0) return 0;
  
  const firstStart = Math.min(...words.map(w => w.start));
  const lastEnd = Math.max(...words.map(w => w.end));
  
  const metrics = computeSpeechRateMetrics(words, firstStart, lastEnd);
  if (!metrics) return 0;
  
  return metrics.effectiveSps;
}

/**
 * Send audio to Deepgram REST API and analyze disfluencies
 * Uses the SAME engine as the rest of the site (speechRateTimeline, syllabify, clutteringProfile)
 */
export async function detectBatteryDisfluencies(
  audioBlob: Blob
): Promise<BatteryDisfluencyResult | null> {
  try {
    // 1. Get Deepgram API key
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
      'get-deepgram-token',
      { method: 'POST' }
    );

    if (tokenError || !tokenData?.apiKey) {
      console.error('Failed to get Deepgram token:', tokenError);
      return null;
    }

    // 2. Send audio to Deepgram REST API (pre-recorded)
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?language=fr&model=nova-2&punctuate=true&utterances=false&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${tokenData.apiKey}`,
          'Content-Type': audioBlob.type || 'audio/webm',
        },
        body: audioBlob,
      }
    );

    if (!response.ok) {
      console.error('Deepgram API error:', response.status);
      return null;
    }

    const dgResult = await response.json();
    const words = dgResult?.results?.channels?.[0]?.alternatives?.[0]?.words;
    const transcript = dgResult?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    if (!words || words.length === 0) {
      console.warn('No words returned from Deepgram');
      return null;
    }

    // 3. Convert to WordTimestamp format WITH proper syllable counting (syllabify.ts)
    const wordTimestamps: WordTimestamp[] = words.map((w: { word: string; start: number; end: number }) => {
      const cleaned = w.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
      const isFiller = FILLER_WORDS.has(cleaned);
      const syllables = countSyllablesWord(cleaned); // Uses dictionary + heuristic
      return {
        word: w.word,
        start: w.start,
        end: w.end,
        duration: w.end - w.start,
        syllables,
        isFiller,
        fillerKey: isFiller ? cleaned : undefined,
      };
    });

    // 4. Run disfluency analysis (same engine as Practice/SessionDetail)
    const analysis = analyzeDisfluency(wordTimestamps);

    // 5. Map to Van Zaalen battery categories
    const details: Record<string, number> = {};
    DISFLUENCY_TYPES.forEach(d => { details[d.key] = 0; });

    for (const marker of analysis.markers) {
      switch (marker.type) {
        case 'repetition':
          details['word_repetition'] = (details['word_repetition'] || 0) + 1;
          break;
        case 'syllabic_repetition':
          details['tense_word_repetition'] = (details['tense_word_repetition'] || 0) + 1;
          break;
        case 'prolongation':
          details['prolongation'] = (details['prolongation'] || 0) + 1;
          break;
        case 'block':
          details['blocage'] = (details['blocage'] || 0) + 1;
          break;
      }
    }

    // Count fillers as interjections (segment_interjection)
    const fillerCount = wordTimestamps.filter(w => w.isFiller).length;
    details['segment_interjection'] = (details['segment_interjection'] || 0) + fillerCount;

    // Detect pause errors: pauses 1.5-3s that aren't blocks (blocks are >3s)
    for (let i = 1; i < wordTimestamps.length; i++) {
      const gap = wordTimestamps[i].start - wordTimestamps[i - 1].end;
      if (gap >= 1.5 && gap < 3.0) {
        const prevWord = wordTimestamps[i - 1].word;
        if (!/[.,!?;:…—–-]$/.test(prevWord)) {
          details['pause_error'] = (details['pause_error'] || 0) + 1;
        }
      }
    }

    // 6. Count syllables using syllabify.ts (NOT raw word count)
    const syllableCount = wordTimestamps.reduce((sum, w) => sum + (w.syllables || 1), 0);

    // 7. Compute articulation rate via speechRateTimeline (speech-only time)
    const articulationRate = computeArticulationRate(wordTimestamps);

    // 8. Extract 5 VA samples from timeline
    const totalDuration = wordTimestamps[wordTimestamps.length - 1].end;
    const { samples: vaSamples, variability: vaVariability } = extractVASamples(wordTimestamps, totalDuration);

    // 9. Run cluttering profile analysis (same engine as SessionDetail)
    const targetSps = 4.3; // Default adult norm for battery context
    const cluttering = analyzeClutteringProfile(wordTimestamps, targetSps);

    return {
      disfluencyDetails: details,
      wordTimestamps,
      syllableCount,
      transcript,
      articulationRate,
      vaSamples,
      vaVariability,
      clutteringProfile: cluttering,
    };
  } catch (err) {
    console.error('Battery disfluency detection error:', err);
    return null;
  }
}
