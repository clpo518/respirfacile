import { EXERCISES } from "@/lib/data/exercises";
import { computeStreak } from "@/lib/streak";

/**
 * Catalogue unique des badges.
 *
 * Il existait trois listes divergentes : celle qui attribuait les badges
 * (app/api/check-badges), celle qui les affichait sur le profil et celle du
 * composant BadgeDisplay. Des badges affichés n'étaient jamais attribuables,
 * et des descriptions ne correspondaient pas à la condition réelle.
 *
 * Règle de gamification : jalons positifs uniquement, aucun classement entre
 * patients, rien qui se perde une fois obtenu.
 */

export interface BadgeSession {
  created_at: string;
  exercise_id?: string | null;
  exercise_category?: string | null;
  score?: number | null;
  duration_seconds?: number | null;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  /** Ce que le patient doit faire, formulé tel qu'il le lira. */
  description: string;
  isEarned: (sessions: BadgeSession[], now?: Date) => boolean;
}

/**
 * Le score d'une séance de Pause Contrôlée n'a pas la même unité selon
 * l'exercice : l'exercice de découverte compte des PAS, les paliers comptent
 * des SECONDES. Les deux familles sont dérivées du catalogue pour éviter que
 * 20 pas déclenchent un badge « 20 secondes ».
 */
const SECONDS_PAUSE_IDS = EXERCISES.filter(
  (e) => e.category === "pause_controlee" && e.metrics_tracked.includes("pause_duration"),
).map((e) => e.id);

const STEPS_PAUSE_IDS = EXERCISES.filter(
  (e) => e.category === "pause_controlee" && e.metrics_tracked.includes("pause_steps"),
).map((e) => e.id);

function bestScore(sessions: BadgeSession[], exerciseIds: string[]): number {
  return sessions
    .filter((s) => s.exercise_id != null && exerciseIds.includes(s.exercise_id))
    .reduce((best, s) => Math.max(best, s.score ?? 0), 0);
}

function distinctPracticeDays(sessions: BadgeSession[]): number {
  return new Set(sessions.map((s) => s.created_at.slice(0, 10))).size;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_session",
    name: "Premier souffle",
    emoji: "🌱",
    description: "Terminer une première séance.",
    isEarned: (sessions) => sessions.length >= 1,
  },
  {
    id: "week_1",
    name: "Une semaine tenue",
    emoji: "📅",
    description: "Sept jours de suite, jokers compris.",
    isEarned: (sessions, now) => computeStreak(sessions.map((s) => s.created_at), now).current >= 7,
  },
  {
    id: "pause_steps_40",
    name: "Quarante pas",
    emoji: "🚶",
    description: "Atteindre 40 pas au score de pause.",
    isEarned: (sessions) => bestScore(sessions, STEPS_PAUSE_IDS) >= 40,
  },
  {
    id: "pause_20",
    name: "Pause 20 secondes",
    emoji: "⏸️",
    description: "Tenir 20 secondes de pause confortable.",
    isEarned: (sessions) => bestScore(sessions, SECONDS_PAUSE_IDS) >= 20,
  },
  {
    id: "pause_25",
    name: "Pause 25 secondes",
    emoji: "🎯",
    description: "Tenir 25 secondes de pause confortable.",
    isEarned: (sessions) => bestScore(sessions, SECONDS_PAUSE_IDS) >= 25,
  },
  {
    id: "nasale_master",
    name: "Nez libre",
    emoji: "👃",
    description: "Dix séances de respiration nasale d'au moins 3 minutes.",
    isEarned: (sessions) =>
      sessions.filter(
        (s) => s.exercise_category === "respiration_nasale" && (s.duration_seconds ?? 0) >= 180,
      ).length >= 10,
  },
  {
    id: "coherence_30",
    name: "Rythme régulier",
    emoji: "💓",
    description: "Trente séances de cohérence cardiaque.",
    isEarned: (sessions) =>
      sessions.filter((s) => s.exercise_category === "coherence_cardiaque").length >= 30,
  },
  {
    id: "month_1",
    name: "Un mois de pratique",
    emoji: "🎖️",
    description: "Vingt jours de pratique répartis sur au moins un mois.",
    isEarned: (sessions) => {
      if (sessions.length === 0) return false;
      // L'ancienne condition ne regardait que l'écart entre la première et la
      // dernière séance : deux séances à un mois d'intervalle suffisaient.
      if (distinctPracticeDays(sessions) < 20) return false;
      const dates = sessions.map((s) => new Date(s.created_at).getTime());
      const spanDays = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
      return spanDays >= 30;
    },
  },
];

export const BADGES_BY_ID = new Map(BADGES.map((badge) => [badge.id, badge]));

/** Badges nouvellement atteints, hors ceux déjà acquis. */
export function newlyEarnedBadges(
  sessions: BadgeSession[],
  alreadyEarned: Iterable<string>,
  now?: Date,
): string[] {
  const earned = new Set(alreadyEarned);
  return BADGES.filter((badge) => !earned.has(badge.id) && badge.isEarned(sessions, now)).map(
    (badge) => badge.id,
  );
}
