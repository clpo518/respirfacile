import { describe, expect, it } from "vitest";
import { daysSince, getRetentionInfo, getRetentionStatus } from "@/lib/retention";

describe("statut de rétention", () => {
  it("distingue un patient qui n'a jamais pratiqué", () => {
    expect(getRetentionStatus(0, false)).toBe("new");
    expect(getRetentionStatus(42, false)).toBe("new");
  });

  it("applique les seuils annoncés au praticien", () => {
    expect(getRetentionStatus(0, true)).toBe("active");
    expect(getRetentionStatus(2, true)).toBe("active");
    expect(getRetentionStatus(3, true)).toBe("slipping");
    expect(getRetentionStatus(5, true)).toBe("slipping");
    expect(getRetentionStatus(6, true)).toBe("dropout");
  });

  it("décrit chaque statut avec un libellé et une couleur", () => {
    for (const status of ["active", "slipping", "dropout", "new"] as const) {
      const info = getRetentionInfo(status);
      expect(info.status).toBe(status);
      expect(info.label.length).toBeGreaterThan(0);
      expect(info.textColor).toMatch(/^text-/);
    }
  });

  it("aligne la description du statut inactif sur le seuil réel", () => {
    // Le tableau de bord affiche « Plus de 5 jours sans séance » : si le seuil
    // bouge dans getRetentionStatus, ce texte devient faux.
    expect(getRetentionStatus(5, true)).toBe("slipping");
    expect(getRetentionStatus(6, true)).toBe("dropout");
    expect(getRetentionInfo("dropout").description).toContain("5 jours");
  });
});

describe("daysSince", () => {
  it("traite une date absente comme une inactivité maximale", () => {
    expect(daysSince(null)).toBe(999);
    expect(daysSince(undefined)).toBe(999);
  });

  it("compte les jours écoulés", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(threeDaysAgo)).toBe(3);
  });
});
