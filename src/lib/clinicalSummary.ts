/**
 * Clinical Summary Generator
 * 
 * Generates professional clinical summaries for therapists to quickly review sessions.
 * Follows French medical terminology standards.
 * Uses SPS (Syllables Per Second) as the primary metric.
 * Includes cluttering (bredouillement) indicators when word timestamps are available.
 */

import { wpmToSps, getAdaptiveThresholds } from "@/lib/spsUtils";
import { analyzeClutteringProfile } from "@/lib/clutteringProfile";
import type { WordTimestamp } from "@/lib/analyzeDisfluency";

export interface ClinicalSummaryInput {
  avgWpm: number;
  maxWpm: number;
  durationSeconds: number;
  wordCount?: number;
  exerciseType?: string | null;
  wordTimestamps?: WordTimestamp[];
  targetWpm?: number | null;
}

/**
 * Returns a clinical status label based on average WPM (converted to SPS internally)
 */
export function getDebitStatus(avgWpm: number): {
  label: string;
  shortLabel: string;
  color: "green" | "yellow" | "red" | "gray";
} {
  const sps = wpmToSps(avgWpm);
  
  if (avgWpm === 0) {
    return { label: "Non mesuré", shortLabel: "—", color: "gray" };
  }
  if (sps < 3.5) {
    return { label: "Débit lent", shortLabel: "Lent", color: "green" };
  }
  if (sps <= 5.5) {
    return { label: "Débit normo-fluent", shortLabel: "Normo-fluent", color: "green" };
  }
  if (sps <= 6.5) {
    return { label: "Débit rapide", shortLabel: "Rapide", color: "yellow" };
  }
  return { label: "Tachylalie", shortLabel: "Tachylalie", color: "red" };
}

/**
 * Gets the exercise type label in French
 */
function getExerciseLabel(exerciseType?: string | null): string {
  switch (exerciseType) {
    case "improvisation":
      return "Oral libre";
    case "dialogue":
      return "Dialogue oral";
    case "repetition":
      return "Répétition";
    case "warmup":
      return "Échauffement";
    case "live_session":
      return "Session en séance";
    case "neuro_projection":
      return "Projection vocale";
    case "retelling":
      return "Récit résumé";
    case "silence_training":
      return "Tolérance au silence";
    case "reading":
    default:
      return "Lecture";
  }
}

/**
 * Formats duration in human-readable French format
 */
function formatDurationText(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}min`;
  }
  return `${mins}min${secs.toString().padStart(2, "0")}`;
}

/**
 * Generates a professional clinical summary sentence
 * 
 * Example output: "Exercice de lecture (3min). Débit normo-fluent (4.5 syll/sec). Volume total de 340 mots."
 */
export function generateClinicalSummary(input: ClinicalSummaryInput): string {
  const { avgWpm, durationSeconds, wordCount, exerciseType, wordTimestamps, targetWpm } = input;
  
  const exerciseLabel = getExerciseLabel(exerciseType);
  const duration = formatDurationText(durationSeconds);
  const status = getDebitStatus(avgWpm);
  const sps = wpmToSps(avgWpm);
  
  let summary = `${exerciseLabel} (${duration}). ${status.label} (${sps} syll/sec)`;
  
  if (wordCount && wordCount > 0) {
    summary += `. ${wordCount} mots`;
  }

  // Add cluttering indicators if word timestamps are available
  if (wordTimestamps && wordTimestamps.length >= 5) {
    const targetSps = targetWpm ? wpmToSps(targetWpm) : sps > 5.5 ? 4.5 : sps;
    const cluttering = analyzeClutteringProfile(wordTimestamps, targetSps);
    if (cluttering && cluttering.severity !== "none") {
      summary += `. ${cluttering.clinicalSummary}`;
    }
  }
  
  return summary;
}

/**
 * Generates a short clinical summary for table views
 * 
 * Example output: "Normo-fluent (4.5 syll/sec)"
 */
export function generateShortSummary(avgWpm: number): string {
  const status = getDebitStatus(avgWpm);
  const sps = wpmToSps(avgWpm);
  return `${status.shortLabel} (${sps} syll/sec)`;
}

/**
 * Returns educational feedback text for patients based on their WPM (displayed as SPS)
 * If targetWpm is provided, feedback is relative to the target instead of absolute thresholds
 */
export function getEducationalFeedback(avgWpm: number, targetWpm?: number | null): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  const avgSps = wpmToSps(avgWpm);
  
  if (avgWpm === 0) {
    return {
      title: "Session terminée",
      description: "Aucune parole détectée pendant cette session.",
      emoji: "—",
      colorClass: "text-muted-foreground",
    };
  }

  // If a target is set, use target-relative feedback with adaptive thresholds
  if (targetWpm && targetWpm > 0) {
    const targetSps = wpmToSps(targetWpm);
    const diff = avgSps - targetSps;
    const { good, bad } = getAdaptiveThresholds(targetSps);

    if (Math.abs(diff) <= good) {
      return {
        title: "Objectif atteint",
        description: `Votre débit de ${avgSps} syll/sec est pile dans l'objectif de ${targetSps} syll/sec. Bravo !`,
        emoji: "✅",
        colorClass: "text-green-600",
      };
    }
    if (diff > good && diff <= bad) {
      return {
        title: "Légèrement au-dessus",
        description: `Votre débit de ${avgSps} syll/sec dépasse l'objectif de ${targetSps} syll/sec. Pensez à marquer davantage les pauses.`,
        emoji: "⚡",
        colorClass: "text-amber-600",
      };
    }
    if (diff > bad) {
      return {
        title: "Débit trop rapide",
        description: `Votre débit de ${avgSps} syll/sec est bien au-dessus de l'objectif de ${targetSps} syll/sec. Essayez de ralentir.`,
        emoji: "🐇",
        colorClass: "text-red-600",
      };
    }
    if (diff < -good && diff >= -bad) {
      return {
        title: "Bien contrôlé",
        description: `Votre débit de ${avgSps} syll/sec est légèrement sous l'objectif de ${targetSps} syll/sec. Bonne maîtrise.`,
        emoji: "🐢",
        colorClass: "text-emerald-600",
      };
    }
    // diff < -bad
    return {
      title: "Régime très lent",
      description: `Votre débit de ${avgSps} syll/sec est très en-dessous de l'objectif de ${targetSps} syll/sec. Vous pouvez accélérer progressivement.`,
      emoji: "🐢",
      colorClass: "text-blue-600",
    };
  }
  
  // Fallback: absolute thresholds when no target is set
  if (avgSps < 3.5) {
    return {
      title: "Débit très contrôlé",
      description: "Débit lent et maîtrisé. Excellent pour travailler la précision articulatoire et la pose de voix.",
      emoji: "🐢",
      colorClass: "text-emerald-600",
    };
  }
  
  if (avgSps <= 5.5) {
    return {
      title: "Débit normo-fluent",
      description: "Rythme conversationnel naturel et confortable pour l'auditeur. Maintenez ce cap !",
      emoji: "✅",
      colorClass: "text-green-600",
    };
  }
  
  if (avgSps <= 6.5) {
    return {
      title: "Débit rapide",
      description: "Tendance à accélérer. Pensez à marquer davantage les pauses respiratoires entre les phrases.",
      emoji: "⚡",
      colorClass: "text-amber-600",
    };
  }
  
  return {
    title: "Tachylalie détectée",
    description: "Tendance à la tachylalie (débit très rapide). L'intelligibilité peut être compromise. Accentuez les pauses respiratoires.",
    emoji: "🐇",
    colorClass: "text-red-600",
  };
}

/**
 * Returns the appropriate color classes for a WPM value
 * If targetWpm is provided, colors are relative to the target
 */
export function getWpmColorClasses(avgWpm: number, targetWpm?: number | null): {
  text: string;
  bg: string;
  border: string;
} {
  // If target is set, derive color from target-relative feedback
  if (targetWpm && targetWpm > 0) {
    const feedback = getEducationalFeedback(avgWpm, targetWpm);
    if (feedback.colorClass.includes("red")) return { text: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800" };
    if (feedback.colorClass.includes("amber")) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" };
    if (feedback.colorClass.includes("blue")) return { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800" };
    return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800" };
  }

  const status = getDebitStatus(avgWpm);
  
  switch (status.color) {
    case "green":
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "yellow":
      return {
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-900/30",
        border: "border-amber-200 dark:border-amber-800",
      };
    case "red":
      return {
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        border: "border-red-200 dark:border-red-800",
      };
    default:
      return {
        text: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
      };
  }
}
