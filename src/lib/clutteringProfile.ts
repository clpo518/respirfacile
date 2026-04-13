/**
 * Cluttering (Bredouillement) Profile Analysis
 * 
 * Detects core cluttering markers from word timestamps:
 * 1. Accélérations — sudden acceleration episodes (rate spikes above threshold)
 * 2. Déficit de pauses — insufficient pausing between phrases/words
 * 3. Variabilité du débit — irregular speech tempo (CV of local SPS)
 * 4. Télescopage syllabique — detected via compression boost in effective SPS
 * 5. Disfluences normales — excessive normal disfluencies (revisions, false starts)
 * 
 * Based on clinical literature:
 * - St. Louis & Schulte (2011): Defining Cluttering
 * - Van Zaalen et al. (2009): Cluttering Assessment
 * - Myers & St. Louis (1992): Cluttering: A Clinical Perspective
 */

import type { WordTimestamp } from "./analyzeDisfluency";
import { analyzeDisfluency } from "./analyzeDisfluency";
import { buildSpeechRateTimeline, type SpeechRateSample } from "./speechRateTimeline";
import { getAdaptiveThresholds } from "./spsUtils";

export interface BurstEvent {
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Peak SPS during the burst */
  peakSps: number;
  /** How much above target */
  overshoot: number;
}

export interface ClutteringProfile {
  /** Number of acceleration episodes detected */
  burstCount: number;
  /** Detailed burst events */
  bursts: BurstEvent[];
  /** Total duration spent in bursts (seconds) */
  burstDurationSeconds: number;
  /** Percentage of speaking time in burst */
  burstPercentage: number;

  /** Average inter-word gap in seconds */
  averageGap: number | null;
  /** Whether pauses are clinically deficient (< 0.12s average) */
  pauseDeficit: boolean;
  /** Pause deficit severity label */
  pauseDeficitLabel: string | null;

  /** Coefficient of Variation of local SPS (rate variability) */
  rateCV: number | null;
  /** Rate variability level */
  rateVariability: "stable" | "variable" | "irregular" | null;

  /** Average compression boost (syllable telescoping indicator) */
  averageCompressionBoost: number;
  /** Whether significant telescoping was detected */
  telescopingDetected: boolean;

  /** Normal disfluency rate (% of words with revisions/repetitions) */
  normalDisfluencyRate: number | null;
  /** Whether normal disfluencies are excessive (> 8% is clinical threshold for cluttering) */
  excessiveDisfluencies: boolean;
  /** Count of normal disfluencies */
  normalDisfluencyCount: number;

  /** Normalized severity score out of 10 */
  severityScore10: number;
  /** Overall cluttering severity */
  severity: "none" | "mild" | "moderate" | "severe";
  /** Summary sentence for patient */
  patientSummary: string;
  /** Summary sentence for therapist */
  clinicalSummary: string;
}

const PAUSE_DEFICIT_THRESHOLD = 0.12; // seconds — clinical threshold for rushed pausing
const SEVERE_PAUSE_DEFICIT = 0.06;
const BURST_MIN_DURATION = 0.5; // raised from 0.25 — reduce sensitivity to brief normal variation
const TELESCOPING_THRESHOLD = 0.3; // compression boost threshold
const NORMAL_DISFLUENCY_THRESHOLD = 0.08; // 8% — clinical threshold for excessive normal disfluencies

/**
 * Analyze word timestamps for cluttering markers
 */
export function analyzeClutteringProfile(
  words: WordTimestamp[] | undefined,
  targetSps: number,
): ClutteringProfile | null {
  if (!words?.length || words.length < 5 || targetSps <= 0) return null;

  const timeline = buildSpeechRateTimeline(words);
  if (timeline.length < 3) return null;

  const { bad } = getAdaptiveThresholds(targetSps);
  // Use the "bad" threshold to only detect real accelerations (not normal variation)
  const burstThreshold = bad;

  // 1. Detect acceleration episodes (contiguous samples above burst threshold)
  const bursts = detectBursts(timeline, targetSps, burstThreshold);

  const burstDuration = bursts.reduce((sum, b) => sum + (b.end - b.start), 0);
  const totalSpeechDuration = timeline.reduce((sum, s) => sum + Math.max(s.end - s.start, 0.01), 0);
  const burstPercentage = totalSpeechDuration > 0 ? Math.round((burstDuration / totalSpeechDuration) * 100) : 0;

  // 2. Pause deficit: average gap between consecutive words
  const { averageGap, pauseDeficit, pauseDeficitLabel } = analyzePauseDeficit(words);

  // 3. Rate variability (CV of SPS samples)
  const { rateCV, rateVariability } = analyzeRateVariability(timeline);

  // 4. Syllable telescoping (from compression boost)
  const { averageCompressionBoost, telescopingDetected } = analyzeTelescopingFromTimeline(timeline);

  // 5. Normal disfluencies (revisions, repetitions — NOT stuttering-type blocks)
  const { normalDisfluencyRate, excessiveDisfluencies, normalDisfluencyCount } = analyzeNormalDisfluencies(words);

  // 6. Overall severity with normalized score /10
  const rawScore = computeRawSeverityScore(
    bursts.length, pauseDeficit, averageGap, rateVariability,
    telescopingDetected, excessiveDisfluencies, normalDisfluencyRate,
  );

  const severityScore10 = Math.min(10, Math.round(rawScore * 10) / 10);

  let severity: ClutteringProfile["severity"];
  if (rawScore === 0) severity = "none";
  else if (rawScore <= 3.5) severity = "mild";
  else if (rawScore <= 6.5) severity = "moderate";
  else severity = "severe";

  // 7. Generate summaries
  const patientSummary = generatePatientSummary(severity, bursts.length, pauseDeficit, telescopingDetected, excessiveDisfluencies);
  const clinicalSummary = generateClinicalSummary(
    severity, severityScore10, bursts.length, burstPercentage, averageGap, rateCV,
    rateVariability, telescopingDetected, averageCompressionBoost,
    normalDisfluencyRate, excessiveDisfluencies,
  );

  return {
    burstCount: bursts.length,
    bursts,
    burstDurationSeconds: Math.round(burstDuration * 10) / 10,
    burstPercentage,
    averageGap,
    pauseDeficit,
    pauseDeficitLabel,
    rateCV,
    rateVariability,
    averageCompressionBoost,
    telescopingDetected,
    normalDisfluencyRate,
    excessiveDisfluencies,
    normalDisfluencyCount,
    severityScore10,
    severity,
    patientSummary,
    clinicalSummary,
  };
}

// ── Burst detection ──────────────────────────────────────────

function detectBursts(timeline: SpeechRateSample[], targetSps: number, threshold: number): BurstEvent[] {
  const bursts: BurstEvent[] = [];
  let currentBurst: { start: number; end: number; peakSps: number } | null = null;

  for (const sample of timeline) {
    const overshoot = sample.sps - targetSps;
    if (overshoot > threshold) {
      if (!currentBurst) {
        currentBurst = { start: sample.start, end: sample.end, peakSps: sample.sps };
      } else {
        currentBurst.end = sample.end;
        currentBurst.peakSps = Math.max(currentBurst.peakSps, sample.sps);
      }
    } else {
      if (currentBurst && (currentBurst.end - currentBurst.start) >= BURST_MIN_DURATION) {
        bursts.push({ ...currentBurst, overshoot: currentBurst.peakSps - targetSps });
      }
      currentBurst = null;
    }
  }
  // Close trailing burst
  if (currentBurst && (currentBurst.end - currentBurst.start) >= BURST_MIN_DURATION) {
    bursts.push({ ...currentBurst, overshoot: currentBurst.peakSps - targetSps });
  }

  return bursts;
}

// ── Pause deficit analysis ──────────────────────────────────────

function analyzePauseDeficit(words: WordTimestamp[]) {
  const sortedWords = [...words]
    .filter(w => Number.isFinite(w.start) && Number.isFinite(w.end) && w.end > w.start && !w.isFiller)
    .sort((a, b) => a.start - b.start);

  const gaps: number[] = [];
  for (let i = 1; i < sortedWords.length; i++) {
    const gap = sortedWords[i].start - sortedWords[i - 1].end;
    if (gap >= 0 && gap < 3.0) gaps.push(gap);
  }

  const averageGap = gaps.length >= 3
    ? Math.round((gaps.reduce((s, g) => s + g, 0) / gaps.length) * 1000) / 1000
    : null;

  const pauseDeficit = averageGap !== null && averageGap < PAUSE_DEFICIT_THRESHOLD;
  let pauseDeficitLabel: string | null = null;
  if (averageGap !== null) {
    if (averageGap < SEVERE_PAUSE_DEFICIT) pauseDeficitLabel = "Pauses très insuffisantes";
    else if (averageGap < PAUSE_DEFICIT_THRESHOLD) pauseDeficitLabel = "Pauses courtes";
  }

  return { averageGap, pauseDeficit, pauseDeficitLabel };
}

// ── Rate variability analysis ──────────────────────────────────

function analyzeRateVariability(timeline: SpeechRateSample[]) {
  const spsValues = timeline.map(s => s.sps);
  let rateCV: number | null = null;
  let rateVariability: ClutteringProfile["rateVariability"] = null;

  if (spsValues.length >= 5) {
    const mean = spsValues.reduce((s, v) => s + v, 0) / spsValues.length;
    if (mean > 0) {
      const variance = spsValues.reduce((s, v) => s + (v - mean) ** 2, 0) / spsValues.length;
      rateCV = Math.round((Math.sqrt(variance) / mean) * 100) / 100;

      if (rateCV < 0.15) rateVariability = "stable";
      else if (rateCV < 0.30) rateVariability = "variable";
      else rateVariability = "irregular";
    }
  }

  return { rateCV, rateVariability };
}

// ── Telescoping analysis ──────────────────────────────────────

function analyzeTelescopingFromTimeline(timeline: SpeechRateSample[]) {
  const boostSamples = timeline.filter(s => s.compressionBoost !== undefined && s.compressionBoost! > 0);
  const averageCompressionBoost = boostSamples.length > 0
    ? Math.round((boostSamples.reduce((s, b) => s + b.compressionBoost!, 0) / boostSamples.length) * 100) / 100
    : 0;
  const telescopingDetected = averageCompressionBoost >= TELESCOPING_THRESHOLD;

  return { averageCompressionBoost, telescopingDetected };
}

// ── Normal disfluency analysis ──────────────────────────────────

function analyzeNormalDisfluencies(words: WordTimestamp[]) {
  const analysis = analyzeDisfluency(words);
  // Count repetitions as normal disfluencies (typical of cluttering)
  // Blocks and prolongations are stuttering-type and not counted here
  const normalDisfluencyCount = analysis.summary.repetitions;
  const totalWords = words.filter(w => !w.isFiller).length;

  const normalDisfluencyRate = totalWords >= 10
    ? Math.round((normalDisfluencyCount / totalWords) * 1000) / 10 // percentage with 1 decimal
    : null;

  const excessiveDisfluencies = normalDisfluencyRate !== null && (normalDisfluencyRate / 100) >= NORMAL_DISFLUENCY_THRESHOLD;

  return { normalDisfluencyRate, excessiveDisfluencies, normalDisfluencyCount };
}

// ── Severity scoring (normalized /10) ──────────────────────────

function computeRawSeverityScore(
  burstCount: number,
  pauseDeficit: boolean,
  averageGap: number | null,
  rateVariability: ClutteringProfile["rateVariability"],
  telescopingDetected: boolean,
  excessiveDisfluencies: boolean,
  normalDisfluencyRate: number | null,
): number {
  let score = 0;

  // Bursts: 0-2 points (capped to reduce over-scoring)
  if (burstCount >= 4) score += 2;
  else if (burstCount >= 2) score += 1.5;
  else if (burstCount >= 1) score += 0.5;

  // Pause deficit: 0-2 points
  if (pauseDeficit) {
    score += averageGap !== null && averageGap < SEVERE_PAUSE_DEFICIT ? 2 : 1;
  }

  // Rate variability: 0-2 points
  if (rateVariability === "irregular") score += 2;
  else if (rateVariability === "variable") score += 1;

  // Telescoping: 0-1.5 points
  if (telescopingDetected) score += 1.5;

  // Normal disfluencies: 0-1.5 points (new marker)
  if (excessiveDisfluencies) {
    score += normalDisfluencyRate !== null && normalDisfluencyRate >= 12 ? 1.5 : 1;
  }

  return score;
}

// ── Summary generators ──────────────────────────────────────────

function generatePatientSummary(
  severity: ClutteringProfile["severity"],
  burstCount: number,
  pauseDeficit: boolean,
  telescoping: boolean,
  excessiveDisfluencies: boolean,
): string {
  if (severity === "none") {
    return "Bon contrôle du rythme — continuez comme ça !";
  }

  const parts: string[] = [];
  if (burstCount > 0) {
    parts.push(
      burstCount === 1
        ? "1 moment d'accélération détecté"
        : `${burstCount} moments d'accélération détectés`,
    );
  }
  if (pauseDeficit) parts.push("les pauses entre les mots sont un peu courtes");
  if (telescoping) parts.push("certains mots sont compressés (syllabes avalées)");
  if (excessiveDisfluencies) parts.push("quelques hésitations et reprises en plus");

  if (parts.length === 0) return "Quelques indices de bredouillement — pensez à respirer entre les phrases.";

  const joined = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    + (parts.length > 1 ? ", " + parts.slice(1).join(" et ") : "")
    + ".";

  const tip = severity === "mild"
    ? " Pensez à bien articuler."
    : " Pensez à respirer et ralentir entre les phrases.";

  return joined + tip;
}

function generateClinicalSummary(
  severity: ClutteringProfile["severity"],
  score10: number,
  burstCount: number,
  burstPct: number,
  avgGap: number | null,
  cv: number | null,
  variability: ClutteringProfile["rateVariability"],
  telescoping: boolean,
  avgBoost: number,
  disfluencyRate: number | null,
  excessiveDisfluencies: boolean,
): string {
  if (severity === "none") return "Pas de signes de bredouillement.";

  const parts: string[] = [];

  if (burstCount > 0) {
    parts.push(`${burstCount} accélération${burstCount > 1 ? "s" : ""} (${burstPct}% du temps de parole)`);
  }
  if (avgGap !== null) {
    parts.push(`pauses inter-mots : ${Math.round(avgGap * 1000)}ms${avgGap < PAUSE_DEFICIT_THRESHOLD ? " (déficit)" : ""}`);
  }
  if (cv !== null) {
    const variabilityLabel = variability === "stable" ? "stable" : variability === "variable" ? "variable" : "irrégulier";
    parts.push(`variabilité du débit : ${cv} (${variabilityLabel})`);
  }
  if (telescoping) {
    parts.push(`télescopage syllabique (boost moy. : +${avgBoost} syll/sec)`);
  }
  if (disfluencyRate !== null && excessiveDisfluencies) {
    parts.push(`disfluences normales : ${disfluencyRate}% (excessif)`);
  }

  const severityLabel = severity === "mild" ? "Léger" : severity === "moderate" ? "Modéré" : "Sévère";

  return `Bredouillement ${severityLabel.toLowerCase()} (${score10}/10) — ${parts.join(" ; ")}.`;
}
