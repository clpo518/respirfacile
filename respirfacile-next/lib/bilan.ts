import { getExerciseById } from "@/lib/data/exercises";
import { toLocalDayKey } from "@/lib/streak";

/**
 * Agrégations du bilan praticien.
 *
 * Tout est calculé ici, sans accès base et sans JSX, pour être testable. Aucune
 * de ces valeurs n'est un indicateur diagnostique : ce sont des mesures de
 * pratique et des scores déclarés, à relire par le praticien.
 */

export interface BilanSession {
  created_at: string;
  exercise_id: string | null;
  score: number | null;
  duration_seconds: number | null;
}

export interface BilanJournalEntry {
  created_at: string;
  wellbeing_score: number | null;
  sleep_score: number | null;
  anxiety_level: number | null;
  nasal_breathing: number | null;
}

export interface WeeklyObservance {
  /** Lundi de la semaine, au format AAAA-MM-JJ. */
  weekStart: string;
  label: string;
  sessions: number;
  /** Jours distincts avec au moins une séance. */
  activeDays: number;
}

export interface ScoreProgress {
  exerciseId: string;
  exerciseName: string;
  unit: string;
  first: number;
  firstDate: string;
  last: number;
  lastDate: string;
  best: number;
  /** Écart entre la première et la dernière mesure. */
  delta: number;
}

function mondayOf(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/**
 * Observance semaine par semaine, de la plus ancienne à la plus récente.
 * Les semaines sans aucune séance sont conservées : un trou est une
 * information clinique, l'effacer donnerait une courbe faussement continue.
 */
export function weeklyObservance(
  sessions: BilanSession[],
  weeks = 8,
  now: Date = new Date(),
): WeeklyObservance[] {
  const result: WeeklyObservance[] = [];
  const currentMonday = mondayOf(now);

  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentMonday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const inWeek = sessions.filter((s) => {
      const d = new Date(s.created_at);
      return d >= start && d < end;
    });

    result.push({
      weekStart: toLocalDayKey(start),
      label: start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      sessions: inWeek.length,
      activeDays: new Set(inWeek.map((s) => toLocalDayKey(new Date(s.created_at)))).size,
    });
  }

  return result;
}

/**
 * Progression des exercices chiffrés, un bloc par exercice.
 * Les exercices sans saisie chiffrée sont ignorés : afficher une progression
 * pour un exercice qui n'en mesure pas n'aurait aucun sens.
 */
export function scoreProgress(sessions: BilanSession[]): ScoreProgress[] {
  const byExercise = new Map<string, BilanSession[]>();

  for (const session of sessions) {
    if (!session.exercise_id || session.score == null) continue;
    const exercise = getExerciseById(session.exercise_id);
    if (!exercise?.requiresInput || !exercise.inputUnit) continue;
    const list = byExercise.get(session.exercise_id) ?? [];
    list.push(session);
    byExercise.set(session.exercise_id, list);
  }

  const result: ScoreProgress[] = [];

  for (const [exerciseId, list] of byExercise) {
    const exercise = getExerciseById(exerciseId)!;
    const sorted = [...list].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    result.push({
      exerciseId,
      exerciseName: exercise.name_fr,
      unit: exercise.inputUnit === "secondes" ? "s" : exercise.inputUnit!,
      first: first.score!,
      firstDate: first.created_at,
      last: last.score!,
      lastDate: last.created_at,
      best: sorted.reduce((best, s) => Math.max(best, s.score!), 0),
      delta: last.score! - first.score!,
    });
  }

  return result.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName, "fr"));
}

export interface JournalTrend {
  key: "wellbeing_score" | "sleep_score" | "anxiety_level" | "nasal_breathing";
  label: string;
  /** true quand une valeur qui monte est une amélioration. */
  higherIsBetter: boolean;
  firstAverage: number | null;
  lastAverage: number | null;
  entries: number;
}

const JOURNAL_FIELDS: Array<Pick<JournalTrend, "key" | "label" | "higherIsBetter">> = [
  { key: "wellbeing_score", label: "Bien-être ressenti", higherIsBetter: true },
  { key: "sleep_score", label: "Qualité du sommeil", higherIsBetter: true },
  { key: "nasal_breathing", label: "Facilité à respirer par le nez", higherIsBetter: true },
  // Une anxiété qui monte n'est pas une bonne nouvelle : sans ce drapeau, le
  // bilan afficherait une flèche verte sur une aggravation.
  { key: "anxiety_level", label: "Anxiété ressentie", higherIsBetter: false },
];

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

/**
 * Moyenne de la première moitié des entrées face à la seconde moitié.
 * Comparer deux entrées isolées serait trop sensible à un mauvais jour.
 */
export function journalTrends(entries: BilanJournalEntry[]): JournalTrend[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const half = Math.floor(sorted.length / 2);
  const firstHalf = half > 0 ? sorted.slice(0, half) : [];
  const lastHalf = half > 0 ? sorted.slice(-half) : sorted;

  return JOURNAL_FIELDS.map((field) => ({
    ...field,
    firstAverage: average(
      firstHalf.map((e) => e[field.key]).filter((v): v is number => v != null),
    ),
    lastAverage: average(
      lastHalf.map((e) => e[field.key]).filter((v): v is number => v != null),
    ),
    entries: sorted.filter((e) => e[field.key] != null).length,
  }));
}

/** Sens d'évolution, en tenant compte de higherIsBetter. */
export function trendDirection(trend: JournalTrend): "amélioration" | "stable" | "dégradation" | null {
  if (trend.firstAverage == null || trend.lastAverage == null) return null;
  const diff = trend.lastAverage - trend.firstAverage;
  if (Math.abs(diff) < 0.5) return "stable";
  const improving = trend.higherIsBetter ? diff > 0 : diff < 0;
  return improving ? "amélioration" : "dégradation";
}
