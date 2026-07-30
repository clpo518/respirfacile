import { describe, expect, it } from "vitest";
import { BADGES, BADGES_BY_ID, newlyEarnedBadges, type BadgeSession } from "@/lib/badges";

const JEUDI = new Date(2026, 6, 30, 10, 0, 0);

function dayISO(offset: number): string {
  const d = new Date(JEUDI);
  d.setDate(d.getDate() - offset);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function session(partial: Partial<BadgeSession> & { created_at: string }): BadgeSession {
  return { exercise_id: null, exercise_category: null, score: null, duration_seconds: null, ...partial };
}

describe("catalogue", () => {
  it("n'a aucun identifiant en double et décrit chaque badge", () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const badge of BADGES) {
      expect(badge.name.length, badge.id).toBeGreaterThan(0);
      expect(badge.description.length, badge.id).toBeGreaterThan(10);
      expect(badge.emoji.length, badge.id).toBeGreaterThan(0);
    }
  });

  it("n'attribue rien à un patient sans séance", () => {
    expect(newlyEarnedBadges([], [], JEUDI)).toEqual([]);
  });

  it("n'attribue jamais deux fois le même badge", () => {
    const sessions = [session({ created_at: dayISO(0) })];
    expect(newlyEarnedBadges(sessions, [], JEUDI)).toContain("first_session");
    expect(newlyEarnedBadges(sessions, ["first_session"], JEUDI)).not.toContain("first_session");
  });
});

describe("unités du score de pause", () => {
  // Régression : l'ancienne condition testait score >= 20 sur toute la
  // catégorie pause_controlee. Un patient qui marchait 20 pas au test de
  // découverte décrochait le badge « Tenir 20 secondes de pause ».
  const vingtPas = [
    session({
      created_at: dayISO(0),
      exercise_id: "pause_controlee_decouverte",
      exercise_category: "pause_controlee",
      score: 26,
    }),
  ];

  it("ne confond pas des pas avec des secondes", () => {
    expect(BADGES_BY_ID.get("pause_20")!.isEarned(vingtPas, JEUDI)).toBe(false);
    expect(BADGES_BY_ID.get("pause_25")!.isEarned(vingtPas, JEUDI)).toBe(false);
  });

  it("attribue le badge de secondes sur le bon exercice", () => {
    const vingtSecondes = [
      session({
        created_at: dayISO(0),
        exercise_id: "pause_20",
        exercise_category: "pause_controlee",
        score: 21,
      }),
    ];
    expect(BADGES_BY_ID.get("pause_20")!.isEarned(vingtSecondes, JEUDI)).toBe(true);
    expect(BADGES_BY_ID.get("pause_25")!.isEarned(vingtSecondes, JEUDI)).toBe(false);
  });

  it("récompense la progression en pas sur l'exercice qui les compte", () => {
    expect(BADGES_BY_ID.get("pause_steps_40")!.isEarned(vingtPas, JEUDI)).toBe(false);
    const quarantePas = [
      session({
        created_at: dayISO(0),
        exercise_id: "pause_controlee_decouverte",
        exercise_category: "pause_controlee",
        score: 41,
      }),
    ];
    expect(BADGES_BY_ID.get("pause_steps_40")!.isEarned(quarantePas, JEUDI)).toBe(true);
  });
});

describe("badge de semaine", () => {
  it("demande une vraie série, pas sept jours épars", () => {
    const epars = [0, 3, 7, 12, 20, 25, 40].map((offset) =>
      session({ created_at: dayISO(offset) }),
    );
    expect(BADGES_BY_ID.get("week_1")!.isEarned(epars, JEUDI)).toBe(false);
  });

  it("accepte une série de sept jours, jokers compris", () => {
    // Six jours pratiqués, un trou couvert par un joker.
    const serie = [0, 1, 2, 4, 5, 6].map((offset) => session({ created_at: dayISO(offset) }));
    expect(BADGES_BY_ID.get("week_1")!.isEarned(serie, JEUDI)).toBe(true);
  });
});

describe("badge du mois", () => {
  it("refuse deux séances espacées d'un mois", () => {
    const deuxSeances = [session({ created_at: dayISO(0) }), session({ created_at: dayISO(35) })];
    expect(BADGES_BY_ID.get("month_1")!.isEarned(deuxSeances, JEUDI)).toBe(false);
  });

  it("accepte vingt jours de pratique étalés sur plus d'un mois", () => {
    const sessions = Array.from({ length: 20 }, (_, i) =>
      session({ created_at: dayISO(i * 2) }),
    );
    expect(BADGES_BY_ID.get("month_1")!.isEarned(sessions, JEUDI)).toBe(true);
  });
});
