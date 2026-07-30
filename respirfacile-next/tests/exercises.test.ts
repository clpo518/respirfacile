import { describe, expect, it } from "vitest";
import {
  EXERCISES,
  getExerciseById,
  getExercisesForProfile,
  getExercisesWithoutProfile,
  getVisibleExercises,
  type PatientProfileType,
} from "@/lib/data/exercises";

const PROFILES: PatientProfileType[] = [
  "adult_saos_mild",
  "adult_saos_severe",
  "adult_tmof",
  "adult_mixed",
];

describe("intégrité du catalogue", () => {
  it("n'a aucun identifiant en double", () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("décrit chaque exercice au patient et au praticien", () => {
    for (const exercise of EXERCISES) {
      expect(exercise.name_fr.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.instructions_fr.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.clinical_rationale_fr.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.therapist_note_fr.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.target_profile.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it("garde des durées et des difficultés exploitables", () => {
    for (const exercise of EXERCISES) {
      expect(exercise.duration_seconds, exercise.id).toBeGreaterThan(0);
      // Contrainte clinique : aucune séance guidée ne dépasse 20 minutes.
      expect(exercise.duration_seconds, exercise.id).toBeLessThanOrEqual(20 * 60);
      expect([1, 2, 3], exercise.id).toContain(exercise.difficulty);
    }
  });

  it("associe un libellé de saisie à tout exercice qui en demande une", () => {
    for (const exercise of EXERCISES.filter((e) => e.requiresInput)) {
      expect(exercise.inputLabel, exercise.id).toBeTruthy();
      expect(exercise.inputUnit, exercise.id).toBeTruthy();
    }
  });

  it("retrouve un exercice par son identifiant", () => {
    expect(getExerciseById("pause_20")?.category).toBe("pause_controlee");
    expect(getExerciseById("inconnu")).toBeUndefined();
  });
});

describe("terminologie destinée au patient", () => {
  // Contrainte terrain : « BOLT » est inconnu des orthophonistes françaises et
  // ne doit jamais apparaître côté patient. Il reste toléré dans la note
  // destinée au praticien, où il sert de repère bibliographique.
  const patientFacingFields = (e: (typeof EXERCISES)[number]) =>
    [
      e.name_fr,
      e.description_fr,
      e.progression_fr,
      ...e.instructions_fr,
      ...(e.tips_fr ?? []),
      ...e.expected_benefits_fr,
    ].join(" ");

  it("n'expose jamais le terme BOLT au patient", () => {
    for (const exercise of EXERCISES) {
      expect(patientFacingFields(exercise), exercise.id).not.toMatch(/\bBOLT\b/i);
    }
  });

  it("ne promet aucune guérison au patient", () => {
    for (const exercise of EXERCISES) {
      expect(patientFacingFields(exercise), exercise.id).not.toMatch(/guéri(r|son|t)/i);
    }
  });
});

describe("garde-fous de sécurité", () => {
  it("contre-indique toute apnée volontaire en SAOS sévère", () => {
    const breathHolds = EXERCISES.filter((e) => e.category === "pause_controlee");
    expect(breathHolds.length).toBeGreaterThan(0);
    for (const exercise of breathHolds) {
      expect(exercise.contraindications ?? [], exercise.id).toContain("adult_saos_severe");
    }
  });

  it("ne propose jamais un exercice contre-indiqué pour le profil", () => {
    for (const profile of PROFILES) {
      for (const exercise of getExercisesForProfile(profile)) {
        expect(exercise.contraindications ?? [], `${profile} / ${exercise.id}`).not.toContain(profile);
      }
    }
  });

  it("écarte la Pause Contrôlée du profil SAOS sévère", () => {
    const ids = getExercisesForProfile("adult_saos_severe").map((e) => e.id);
    expect(ids).not.toContain("pause_controlee_decouverte");
    expect(ids).not.toContain("pause_20");
    expect(ids).not.toContain("pause_25");
  });

  it("n'ouvre aucune apnée volontaire tant qu'aucun profil n'est prescrit", () => {
    // Régression : l'écran /exercises affichait tout le catalogue quand le
    // praticien n'avait pas encore créé de programme, apnées comprises.
    const categories = getExercisesWithoutProfile().map((e) => e.category);
    expect(categories).not.toContain("pause_controlee");
    expect(getVisibleExercises(null)).toEqual(getExercisesWithoutProfile());
  });

  it("laisse chaque profil avec de quoi travailler", () => {
    for (const profile of PROFILES) {
      expect(getExercisesForProfile(profile).length, profile).toBeGreaterThanOrEqual(5);
    }
    expect(getExercisesWithoutProfile().length).toBeGreaterThanOrEqual(5);
  });
});
