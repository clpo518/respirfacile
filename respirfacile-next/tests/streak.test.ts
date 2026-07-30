import { describe, expect, it } from "vitest";
import { JOKERS_PER_WEEK, computeStreak, streakMessage, toWeekKey } from "@/lib/streak";

/** Jeudi 30 juillet 2026, 10 h locales. Référence fixe pour tous les cas. */
const JEUDI = new Date(2026, 6, 30, 10, 0, 0);

/** Construit des dates de séance à N jours avant la référence. */
function daysBefore(...offsets: number[]): Date[] {
  return offsets.map((offset) => {
    const d = new Date(JEUDI);
    d.setDate(d.getDate() - offset);
    d.setHours(9, 0, 0, 0);
    return d;
  });
}

describe("série sans joker", () => {
  it("part de zéro sans aucune séance", () => {
    const result = computeStreak([], JEUDI);
    expect(result.current).toBe(0);
    expect(result.practicedToday).toBe(false);
    expect(result.jokersLeftThisWeek).toBe(JOKERS_PER_WEEK);
  });

  it("compte les jours consécutifs, séance du jour comprise", () => {
    const result = computeStreak(daysBefore(0, 1, 2), JEUDI);
    expect(result.current).toBe(3);
    expect(result.practicedDays).toBe(3);
    expect(result.jokerDays).toBe(0);
    expect(result.practicedToday).toBe(true);
  });

  it("ne casse pas la série tant que la journée en cours n'est pas finie", () => {
    // Séances hier et avant-hier, rien aujourd'hui : la série doit tenir.
    const result = computeStreak(daysBefore(1, 2), JEUDI);
    expect(result.current).toBe(2);
    expect(result.practicedToday).toBe(false);
  });

  it("ignore plusieurs séances le même jour", () => {
    const [hier] = daysBefore(1);
    const autreHier = new Date(hier);
    autreHier.setHours(20, 0, 0, 0);
    const result = computeStreak([hier, autreHier], JEUDI);
    expect(result.current).toBe(1);
  });
});

describe("jokers", () => {
  it("absorbe un jour manqué sans remettre la série à zéro", () => {
    // Séances J, J-1, puis trou en J-2, puis J-3 et J-4.
    const result = computeStreak(daysBefore(0, 1, 3, 4), JEUDI);
    expect(result.current).toBe(5);
    expect(result.practicedDays).toBe(4);
    expect(result.jokerDays).toBe(1);
    expect(result.jokersUsedThisWeek).toBe(1);
    expect(result.jokersLeftThisWeek).toBe(1);
  });

  it("absorbe deux jours manqués dans la même semaine", () => {
    // Trous en J-1 et J-3, dans la semaine du lundi 27 juillet.
    const result = computeStreak(daysBefore(0, 2, 4), JEUDI);
    expect(result.jokerDays).toBe(2);
    expect(result.current).toBe(5);
    expect(result.jokersLeftThisWeek).toBe(0);
  });

  it("arrête la série au troisième jour manqué de la semaine", () => {
    // Référence dimanche 2 août : toute la série tient dans la semaine du
    // lundi 27 juillet, donc dans un seul budget de jokers.
    const dimanche = new Date(2026, 7, 2, 10, 0, 0);
    const seances = [0, 2, 4].map((offset) => {
      const d = new Date(dimanche);
      d.setDate(d.getDate() - offset);
      d.setHours(9, 0, 0, 0);
      return d;
    });
    // Pratiqué dimanche, vendredi, mercredi. Trous samedi et jeudi (2 jokers),
    // puis mardi qui dépasse le budget et arrête la série.
    const result = computeStreak(seances, dimanche);
    expect(result.jokerDays).toBe(2);
    expect(result.practicedDays).toBe(3);
    expect(result.current).toBe(5);
    expect(result.jokersLeftThisWeek).toBe(0);
  });

  it("rend un budget neuf à la semaine précédente", () => {
    // Semaine en cours : lundi 27 au jeudi 30. Trous en J-1 (mercredi) et
    // J-4 (dimanche 26, semaine précédente) : chacun puise dans sa semaine.
    const result = computeStreak(daysBefore(0, 2, 3, 5, 6), JEUDI);
    expect(result.jokerDays).toBe(2);
    expect(result.jokersUsedThisWeek).toBe(1);
    expect(result.jokersLeftThisWeek).toBe(1);
    expect(result.current).toBe(7);
  });

  it("ne prolonge pas la série avant la toute première séance", () => {
    // Une seule séance, il y a deux jours. Les jokers couvrent hier, mais ne
    // doivent inventer aucun jour antérieur à cette première pratique.
    const result = computeStreak(daysBefore(2), JEUDI);
    expect(result.practicedDays).toBe(1);
    expect(result.jokerDays).toBe(1);
    expect(result.current).toBe(2);

    const isolee = computeStreak(daysBefore(0), JEUDI);
    expect(isolee.current).toBe(1);
    expect(isolee.jokerDays).toBe(0);
  });
});

describe("semaine calendaire", () => {
  it("commence le lundi", () => {
    const lundi = new Date(2026, 6, 27, 8, 0, 0);
    const dimanche = new Date(2026, 7, 2, 23, 0, 0);
    expect(toWeekKey(lundi)).toBe("2026-07-27");
    expect(toWeekKey(dimanche)).toBe("2026-07-27");
    expect(toWeekKey(new Date(2026, 7, 3, 1, 0, 0))).toBe("2026-08-03");
  });
});

describe("message affiché", () => {
  it("ne culpabilise jamais", () => {
    const messages = [
      streakMessage(computeStreak([], JEUDI)),
      streakMessage(computeStreak(daysBefore(0, 1), JEUDI)),
      streakMessage(computeStreak(daysBefore(1, 2), JEUDI)),
      streakMessage(computeStreak(daysBefore(0, 2, 3), JEUDI)),
    ];
    for (const message of messages) {
      expect(message).not.toMatch(/perdu|raté|échec|rompue|brisée|zéro/i);
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it("rassure explicitement quand un joker a servi", () => {
    const result = computeStreak(daysBefore(0, 2, 3), JEUDI);
    expect(result.jokerDays).toBe(1);
    expect(streakMessage(result)).toMatch(/série continue|préservée/i);
  });
});
