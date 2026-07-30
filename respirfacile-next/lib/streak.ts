/**
 * Série de pratique, avec jokers.
 *
 * Contrainte clinique non négociable : sur un exercice thérapeutique, la série
 * ne doit pas être punitive. Un patient qui rate un jour parce qu'il a mal
 * dormi, qu'il est malade ou qu'il travaille de nuit ne doit pas voir son
 * compteur retomber à zéro : c'est exactement le moment où il décroche.
 *
 * Règle retenue : 2 jokers par semaine calendaire (du lundi au dimanche). Un
 * jour manqué consomme un joker de SA semaine et la série continue. Quand les
 * jokers de la semaine sont épuisés, la série s'arrête à ce jour-là.
 *
 * Le calcul est dérivé des séances, sans état stocké : pas de tâche planifiée
 * hebdomadaire à maintenir, et donc pas de dérive possible entre ce que voit
 * le patient et ce qu'il a réellement fait. Les colonnes `jokers_used` et
 * `jokers_reset_at` de `patient_programs` deviennent inutiles.
 */

export const JOKERS_PER_WEEK = 2;

/** Nombre maximal de jours remontés. Un an suffit largement et borne le calcul. */
const MAX_LOOKBACK_DAYS = 366;

export interface StreakResult {
  /** Longueur de la série en cours, jours joker inclus. */
  current: number;
  /** Jours effectivement pratiqués dans la série. */
  practicedDays: number;
  /** Jours manqués absorbés par un joker dans la série. */
  jokerDays: number;
  /** Jokers déjà consommés sur la semaine en cours. */
  jokersUsedThisWeek: number;
  /** Jokers encore disponibles sur la semaine en cours. */
  jokersLeftThisWeek: number;
  /** La séance du jour est-elle déjà faite ? */
  practicedToday: boolean;
}

/** Date locale au format AAAA-MM-JJ. `toISOString` décalerait les séances du soir. */
export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Clé de la semaine calendaire commençant le lundi, utilisée comme budget de jokers. */
export function toWeekKey(date: Date): string {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  // getDay() renvoie 0 pour dimanche : on le ramène en fin de semaine.
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return toLocalDayKey(monday);
}

/**
 * @param sessionDates dates de séance, brutes (ISO) ou objets Date. Les
 *                     doublons d'un même jour comptent pour un.
 * @param now          instant de référence, injecté pour rendre le calcul testable.
 */
export function computeStreak(
  sessionDates: Array<string | Date>,
  now: Date = new Date(),
): StreakResult {
  const practiced = new Set(
    sessionDates.map((value) => toLocalDayKey(value instanceof Date ? value : new Date(value))),
  );

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const practicedToday = practiced.has(toLocalDayKey(today));

  const empty: StreakResult = {
    current: 0,
    practicedDays: 0,
    jokerDays: 0,
    jokersUsedThisWeek: 0,
    jokersLeftThisWeek: JOKERS_PER_WEEK,
    practicedToday,
  };

  if (practiced.size === 0) return empty;

  // La journée en cours n'est pas encore finie : ne pas la compter comme
  // manquée tant qu'elle n'est pas écoulée, sinon la série casserait chaque
  // matin au réveil.
  const cursor = new Date(today);
  if (!practicedToday) cursor.setDate(cursor.getDate() - 1);

  const jokersByWeek = new Map<string, number>();
  let practicedDays = 0;
  let jokerDays = 0;

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const dayKey = toLocalDayKey(cursor);

    if (practiced.has(dayKey)) {
      practicedDays++;
    } else {
      const weekKey = toWeekKey(cursor);
      const used = jokersByWeek.get(weekKey) ?? 0;
      if (used >= JOKERS_PER_WEEK) break;
      jokersByWeek.set(weekKey, used + 1);
      jokerDays++;
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  // Un joker posé avant la toute première séance ne protège rien : on retire
  // les jours joker qui traînent en fin de série.
  let current = practicedDays + jokerDays;
  if (practicedDays === 0) {
    return { ...empty, practicedToday };
  }
  const trailingJokers = countTrailingJokers(practiced, today, practicedToday, current);
  current -= trailingJokers;
  jokerDays -= trailingJokers;

  const currentWeekKey = toWeekKey(today);
  const jokersUsedThisWeek = Math.min(
    jokersByWeek.get(currentWeekKey) ?? 0,
    JOKERS_PER_WEEK,
  );

  return {
    current,
    practicedDays,
    jokerDays,
    jokersUsedThisWeek,
    jokersLeftThisWeek: JOKERS_PER_WEEK - jokersUsedThisWeek,
    practicedToday,
  };
}

/** Jours joker situés avant la séance la plus ancienne de la série. */
function countTrailingJokers(
  practiced: Set<string>,
  today: Date,
  practicedToday: boolean,
  streakLength: number,
): number {
  const cursor = new Date(today);
  if (!practicedToday) cursor.setDate(cursor.getDate() - 1);
  cursor.setDate(cursor.getDate() - (streakLength - 1));

  let trailing = 0;
  while (trailing < streakLength && !practiced.has(toLocalDayKey(cursor))) {
    trailing++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return trailing;
}

/**
 * Message affiché sous la série. Jamais culpabilisant : on décrit ce qui s'est
 * passé, on ne reproche rien.
 */
export function streakMessage(result: StreakResult): string {
  if (result.current === 0) {
    return "Votre première séance lancera la série.";
  }
  if (result.jokerDays > 0 && !result.practicedToday) {
    return "Un jour sans séance, ça arrive. Votre série est préservée.";
  }
  if (result.jokerDays > 0) {
    return "Un jour manqué a été couvert cette semaine, la série continue.";
  }
  if (!result.practicedToday) {
    return "Série intacte. Une séance aujourd'hui et elle avance.";
  }
  return "Séance du jour faite. C'est la régularité qui compte.";
}
