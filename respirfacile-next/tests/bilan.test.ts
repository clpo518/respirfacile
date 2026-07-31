import { describe, expect, it } from "vitest";
import {
  journalTrends,
  scoreProgress,
  trendDirection,
  weeklyObservance,
  type BilanJournalEntry,
  type BilanSession,
} from "@/lib/bilan";

/** Jeudi 30 juillet 2026. Semaine calendaire du lundi 27 juillet. */
const JEUDI = new Date(2026, 6, 30, 10, 0, 0);

function at(offsetDays: number): string {
  const d = new Date(JEUDI);
  d.setDate(d.getDate() - offsetDays);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function session(partial: Partial<BilanSession> & { created_at: string }): BilanSession {
  return { exercise_id: null, score: null, duration_seconds: null, ...partial };
}

describe("observance hebdomadaire", () => {
  it("rend une ligne par semaine demandée, de la plus ancienne à la plus récente", () => {
    const weeks = weeklyObservance([], 8, JEUDI);
    expect(weeks).toHaveLength(8);
    expect(weeks[0].weekStart < weeks[7].weekStart).toBe(true);
    expect(weeks[7].weekStart).toBe("2026-07-27");
  });

  it("conserve les semaines vides", () => {
    // Une seule séance il y a trois semaines : les autres semaines restent
    // affichées à zéro, un trou est une information pour le praticien.
    const weeks = weeklyObservance([session({ created_at: at(21) })], 8, JEUDI);
    expect(weeks.filter((w) => w.sessions === 0)).toHaveLength(7);
    expect(weeks.filter((w) => w.sessions === 1)).toHaveLength(1);
  });

  it("distingue le nombre de séances des jours actifs", () => {
    const deuxLeMemeJour = [
      session({ created_at: at(0) }),
      session({ created_at: at(0) }),
      session({ created_at: at(1) }),
    ];
    const semaine = weeklyObservance(deuxLeMemeJour, 1, JEUDI)[0];
    expect(semaine.sessions).toBe(3);
    expect(semaine.activeDays).toBe(2);
  });
});

describe("progression des scores", () => {
  it("sépare les exercices et garde l'unité de chacun", () => {
    const sessions = [
      session({ created_at: at(20), exercise_id: "pause_controlee_decouverte", score: 12 }),
      session({ created_at: at(2), exercise_id: "pause_controlee_decouverte", score: 28 }),
      session({ created_at: at(10), exercise_id: "pause_20", score: 18 }),
      session({ created_at: at(1), exercise_id: "pause_20", score: 22 }),
    ];
    const progress = scoreProgress(sessions);
    expect(progress).toHaveLength(2);

    const pas = progress.find((p) => p.exerciseId === "pause_controlee_decouverte")!;
    expect(pas.unit).toBe("pas");
    expect(pas.first).toBe(12);
    expect(pas.last).toBe(28);
    expect(pas.delta).toBe(16);

    const secondes = progress.find((p) => p.exerciseId === "pause_20")!;
    expect(secondes.unit).toBe("s");
    expect(secondes.delta).toBe(4);
  });

  it("retient le meilleur score même s'il n'est pas le dernier", () => {
    const sessions = [
      session({ created_at: at(9), exercise_id: "pause_20", score: 15 }),
      session({ created_at: at(5), exercise_id: "pause_20", score: 30 }),
      session({ created_at: at(1), exercise_id: "pause_20", score: 24 }),
    ];
    const [progress] = scoreProgress(sessions);
    expect(progress.best).toBe(30);
    expect(progress.last).toBe(24);
  });

  it("ignore les exercices sans saisie chiffrée", () => {
    const sessions = [
      session({ created_at: at(3), exercise_id: "coherence_5_5", score: 5 }),
      session({ created_at: at(1), exercise_id: "langue_palais", score: 120 }),
    ];
    expect(scoreProgress(sessions)).toEqual([]);
  });
});

describe("tendances du journal", () => {
  function entry(offset: number, values: Partial<BilanJournalEntry>): BilanJournalEntry {
    return {
      created_at: at(offset),
      wellbeing_score: null,
      sleep_score: null,
      anxiety_level: null,
      nasal_breathing: null,
      ...values,
    };
  }

  it("compare la première moitié des entrées à la seconde", () => {
    const entries = [
      entry(40, { wellbeing_score: 4 }),
      entry(30, { wellbeing_score: 4 }),
      entry(10, { wellbeing_score: 8 }),
      entry(3, { wellbeing_score: 8 }),
    ];
    const bienEtre = journalTrends(entries).find((t) => t.key === "wellbeing_score")!;
    expect(bienEtre.firstAverage).toBe(4);
    expect(bienEtre.lastAverage).toBe(8);
    expect(trendDirection(bienEtre)).toBe("amélioration");
  });

  it("lit une anxiété qui monte comme une dégradation", () => {
    // Garde-fou : sans le drapeau higherIsBetter, une anxiété qui grimpe
    // s'afficherait comme une amélioration.
    const entries = [
      entry(40, { anxiety_level: 3 }),
      entry(30, { anxiety_level: 3 }),
      entry(10, { anxiety_level: 8 }),
      entry(3, { anxiety_level: 8 }),
    ];
    const anxiete = journalTrends(entries).find((t) => t.key === "anxiety_level")!;
    expect(anxiete.higherIsBetter).toBe(false);
    expect(trendDirection(anxiete)).toBe("dégradation");
  });

  it("ne conclut rien sans données", () => {
    const trends = journalTrends([]);
    for (const trend of trends) {
      expect(trend.firstAverage).toBeNull();
      expect(trend.lastAverage).toBeNull();
      expect(trendDirection(trend)).toBeNull();
    }
  });

  it("reste stable sur une variation faible", () => {
    const entries = [
      entry(20, { sleep_score: 6 }),
      entry(15, { sleep_score: 6 }),
      entry(5, { sleep_score: 6 }),
      entry(1, { sleep_score: 6 }),
    ];
    const sommeil = journalTrends(entries).find((t) => t.key === "sleep_score")!;
    expect(trendDirection(sommeil)).toBe("stable");
  });
});
