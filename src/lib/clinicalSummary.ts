import { wpmToSps, getAdaptiveThresholds } from "@/lib/spsUtils";

export interface ClinicalSummaryInput {
  avgWpm: number;
  maxWpm: number;
  durationSeconds: number;
  wordCount?: number;
  exerciseType?: string | null;
  targetWpm?: number | null;
}

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
    return { label: "Score contrôlé", shortLabel: "Contrôlé", color: "green" };
  }
  if (sps <= 5.5) {
    return { label: "Score optimal", shortLabel: "Optimal", color: "green" };
  }
  if (sps <= 6.5) {
    return { label: "Score élevé", shortLabel: "Élevé", color: "yellow" };
  }
  return { label: "Score très élevé", shortLabel: "Très élevé", color: "red" };
}

function getExerciseLabel(exerciseType?: string | null): string {
  switch (exerciseType) {
    case "improvisation":
      return "Exercice libre";
    case "dialogue":
      return "Exercice dialogue";
    case "repetition":
      return "Répétition";
    case "warmup":
      return "Échauffement";
    case "live_session":
      return "Séance en cabinet";
    case "reading":
    default:
      return "Exercice de lecture";
  }
}

function formatDurationText(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}min`;
  return `${mins}min${secs.toString().padStart(2, "0")}`;
}

export function generateClinicalSummary(input: ClinicalSummaryInput): string {
  const { avgWpm, durationSeconds, wordCount, exerciseType } = input;

  const exerciseLabel = getExerciseLabel(exerciseType);
  const duration = formatDurationText(durationSeconds);
  const status = getDebitStatus(avgWpm);
  const sps = wpmToSps(avgWpm);

  let summary = `${exerciseLabel} (${duration}). ${status.label} (${sps} pts)`;

  if (wordCount && wordCount > 0) {
    summary += `. ${wordCount} mots`;
  }

  return summary;
}

export function generateShortSummary(avgWpm: number): string {
  const status = getDebitStatus(avgWpm);
  const sps = wpmToSps(avgWpm);
  return `${status.shortLabel} (${sps} pts)`;
}

export function getEducationalFeedback(avgWpm: number, targetWpm?: number | null): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  const avgSps = wpmToSps(avgWpm);

  if (avgWpm === 0) {
    return {
      title: "Séance terminée",
      description: "Aucune activité détectée pendant cette séance.",
      emoji: "—",
      colorClass: "text-muted-foreground",
    };
  }

  if (targetWpm && targetWpm > 0) {
    const targetSps = wpmToSps(targetWpm);
    const diff = avgSps - targetSps;
    const { good, bad } = getAdaptiveThresholds(targetSps);

    if (Math.abs(diff) <= good) {
      return {
        title: "Objectif atteint",
        description: `Votre score de ${avgSps} pts est pile dans l'objectif de ${targetSps} pts. Bravo !`,
        emoji: "✅",
        colorClass: "text-green-600",
      };
    }
    if (diff > good && diff <= bad) {
      return {
        title: "Légèrement au-dessus",
        description: `Votre score de ${avgSps} pts dépasse l'objectif de ${targetSps} pts. Pensez à marquer davantage les pauses.`,
        emoji: "⚡",
        colorClass: "text-amber-600",
      };
    }
    if (diff > bad) {
      return {
        title: "Score trop élevé",
        description: `Votre score de ${avgSps} pts est bien au-dessus de l'objectif de ${targetSps} pts. Essayez de ralentir.`,
        emoji: "🐇",
        colorClass: "text-red-600",
      };
    }
    if (diff < -good && diff >= -bad) {
      return {
        title: "Bien contrôlé",
        description: `Votre score de ${avgSps} pts est légèrement sous l'objectif de ${targetSps} pts. Bonne maîtrise.`,
        emoji: "🐢",
        colorClass: "text-emerald-600",
      };
    }
    return {
      title: "Régime très lent",
      description: `Votre score de ${avgSps} pts est très en-dessous de l'objectif de ${targetSps} pts. Vous pouvez accélérer progressivement.`,
      emoji: "🐢",
      colorClass: "text-blue-600",
    };
  }

  if (avgSps < 3.5) {
    return {
      title: "Score très contrôlé",
      description: "Rythme lent et maîtrisé. Excellent pour travailler la précision respiratoire.",
      emoji: "🐢",
      colorClass: "text-emerald-600",
    };
  }

  if (avgSps <= 5.5) {
    return {
      title: "Score optimal",
      description: "Rythme dans la cible thérapeutique. Maintenez ce cap !",
      emoji: "✅",
      colorClass: "text-green-600",
    };
  }

  if (avgSps <= 6.5) {
    return {
      title: "Score élevé",
      description: "Tendance à accélérer. Pensez à marquer davantage les pauses respiratoires.",
      emoji: "⚡",
      colorClass: "text-amber-600",
    };
  }

  return {
    title: "Score très élevé",
    description: "Score au-dessus de la cible. Accentuez les pauses respiratoires entre les phrases.",
    emoji: "🐇",
    colorClass: "text-red-600",
  };
}

export function getWpmColorClasses(avgWpm: number, targetWpm?: number | null): {
  text: string;
  bg: string;
  border: string;
} {
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
      return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800" };
    case "yellow":
      return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" };
    case "red":
      return { text: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800" };
    default:
      return { text: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
  }
}
