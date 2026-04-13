import type { WordTimestamp } from "./analyzeDisfluency";
import { countSyllablesWord } from "./syllabify";

export interface SpeechInterval {
  start: number;
  end: number;
}

export interface SpeechRateSample {
  time: number;
  sps: number;
  start: number;
  end: number;
  rawSps?: number;
  compressionBoost?: number;
  wordRateEquivalent?: number;
}

export interface SpeechRateMetrics {
  rawSps: number;
  effectiveSps: number;
  articulationSeconds: number;
  wordRateEquivalent: number;
  compressionBoost: number;
  averageGap: number | null;
  averageWordDuration: number | null;
}

interface TimelineOptions {
  duration?: number;
  step?: number;
  windowSeconds?: number;
  minArticulationSeconds?: number;
  mergeGapSeconds?: number;
}

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const getWordDuration = (word: WordTimestamp) => Math.max(word.duration || word.end - word.start, 0.08);

const getWordSyllables = (word: WordTimestamp) => Math.max(1, word.syllables ?? countSyllablesWord(word.word));

export function computeSpeechRateMetrics(
  words: WordTimestamp[],
  windowStart: number,
  windowEnd: number,
  minArticulationSeconds = 0.18,
): SpeechRateMetrics | null {
  if (windowEnd <= windowStart) return null;

  const windowWords = words.filter((word) => word.end > windowStart && word.start < windowEnd);
  const spokenWords = windowWords.filter((word) => !word.isFiller);

  if (!spokenWords.length) return null;

  let articulationSeconds = 0;
  let weightedSyllables = 0;

  for (const word of spokenWords) {
    const overlap = Math.max(0, Math.min(word.end, windowEnd) - Math.max(word.start, windowStart));
    if (overlap <= 0) continue;

    articulationSeconds += overlap;
    weightedSyllables += getWordSyllables(word) * (overlap / getWordDuration(word));
  }

  if (articulationSeconds < minArticulationSeconds) return null;

  const rawSps = weightedSyllables / articulationSeconds;
  const windowDuration = Math.max(windowEnd - windowStart, 0.1);
  const startedWords = spokenWords.filter((word) => word.start >= windowStart && word.start < windowEnd);
  const averageGap = mean(
    spokenWords.slice(1).map((word, index) => Math.max(0, word.start - spokenWords[index].end)),
  );
  const averageWordDuration = mean(spokenWords.map((word) => getWordDuration(word)));
  const wordRateEquivalent = (startedWords.length / windowDuration) * 1.8;

  const cadenceEquivalent =
    spokenWords.length >= 2 && averageGap !== null && averageWordDuration !== null
      ? 1.8 / Math.max(averageWordDuration + Math.max(averageGap, 0.02), 0.2)
      : wordRateEquivalent;

  const gapCompression = averageGap === null ? 0 : clamp((0.14 - averageGap) / 0.12, 0, 1);
  const durationCompression = averageWordDuration === null ? 0 : clamp((0.36 - averageWordDuration) / 0.18, 0, 1);
  const compressionConfidence = spokenWords.length >= 2
    ? clamp(Math.max(gapCompression, durationCompression * 0.85), 0, 1)
    : 0;
  const compressedEquivalent = Math.max(wordRateEquivalent, cadenceEquivalent);
  const compressionBoost = Math.max(0, compressedEquivalent - rawSps) * compressionConfidence;
  const effectiveSps = Math.min(12, rawSps + compressionBoost);

  return {
    rawSps: roundTo(rawSps, 1),
    effectiveSps: roundTo(effectiveSps, 1),
    articulationSeconds: roundTo(articulationSeconds, 3),
    wordRateEquivalent: roundTo(wordRateEquivalent, 1),
    compressionBoost: roundTo(compressionBoost, 2),
    averageGap: averageGap === null ? null : roundTo(averageGap, 3),
    averageWordDuration: averageWordDuration === null ? null : roundTo(averageWordDuration, 3),
  };
}

export function getSpeechIntervals(words: WordTimestamp[], mergeGapSeconds = 0.08): SpeechInterval[] {
  const usableWords = words
    .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start)
    .sort((a, b) => a.start - b.start);

  if (!usableWords.length) return [];

  const intervals: SpeechInterval[] = [];

  for (const word of usableWords) {
    const previous = intervals[intervals.length - 1];
    if (!previous || word.start > previous.end + mergeGapSeconds) {
      intervals.push({ start: word.start, end: word.end });
      continue;
    }

    previous.end = Math.max(previous.end, word.end);
  }

  return intervals;
}

export function buildSpeechRateTimeline(
  words: WordTimestamp[] | undefined,
  {
    duration,
    step = 0.12,
    windowSeconds = 1.6,
    minArticulationSeconds = 0.18,
    mergeGapSeconds = 0.08,
  }: TimelineOptions = {},
): SpeechRateSample[] {
  if (!words?.length) return [];

  const usableWords = words
    .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start)
    .sort((a, b) => a.start - b.start);

  if (!usableWords.length) return [];

  const maxDuration = duration ?? usableWords[usableWords.length - 1].end;
  const intervals = getSpeechIntervals(usableWords, mergeGapSeconds);
  const halfWindow = windowSeconds / 2;

  const internalSamples: Array<SpeechRateSample & { segmentId: number }> = [];

  intervals.forEach((interval, segmentId) => {
    const intervalStart = Math.max(0, interval.start);
    const intervalEnd = Math.min(maxDuration, interval.end);

    if (intervalEnd <= intervalStart) return;

    for (let cursor = intervalStart; cursor <= intervalEnd + 1e-6; cursor += step) {
      const time = Math.min(cursor, intervalEnd);
      const windowStart = Math.max(0, time - halfWindow);
      const windowEnd = Math.min(maxDuration, time + halfWindow);
      const metrics = computeSpeechRateMetrics(usableWords, windowStart, windowEnd, minArticulationSeconds);
      if (!metrics) continue;

      internalSamples.push({
        time: roundTo(time, 3),
        sps: metrics.effectiveSps,
        start: time,
        end: time,
        rawSps: metrics.rawSps,
        compressionBoost: metrics.compressionBoost,
        wordRateEquivalent: metrics.wordRateEquivalent,
        segmentId,
      });
    }
  });

  return internalSamples.map((sample, index, array) => {
    const previous = index > 0 && array[index - 1].segmentId === sample.segmentId ? array[index - 1] : null;
    const next = index < array.length - 1 && array[index + 1].segmentId === sample.segmentId ? array[index + 1] : null;
    const interval = intervals[sample.segmentId];

    return {
      time: sample.time,
      sps: sample.sps,
      start: roundTo(previous ? (previous.time + sample.time) / 2 : interval.start, 3),
      end: roundTo(next ? (sample.time + next.time) / 2 : interval.end, 3),
      rawSps: sample.rawSps,
      compressionBoost: sample.compressionBoost,
      wordRateEquivalent: sample.wordRateEquivalent,
    };
  });
}