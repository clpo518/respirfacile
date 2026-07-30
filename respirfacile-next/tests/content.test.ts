import { describe, expect, it } from "vitest";
import { CLINICAL_STUDIES, EVIDENCE_DISCLAIMER } from "@/lib/content/evidence";
import { FAQS, faqJsonLd } from "@/lib/content/faq";

describe("références cliniques", () => {
  it("associe à chaque résultat sa source et sa limite", () => {
    expect(CLINICAL_STUDIES.length).toBeGreaterThan(0);
    for (const study of CLINICAL_STUDIES) {
      expect(study.fullRef, study.id).toMatch(/\d{4}/);
      expect(study.url, study.id).toMatch(/^https:\/\//);
      expect(study.caveat.length, study.id).toBeGreaterThan(20);
    }
  });

  it("rappelle que l'application n'est pas un dispositif médical", () => {
    expect(EVIDENCE_DISCLAIMER).toMatch(/diagnostic/i);
    expect(EVIDENCE_DISCLAIMER).toMatch(/remplace/i);
  });
});

describe("questions fréquentes", () => {
  it("ne pose aucune question en double", () => {
    const questions = FAQS.map((f) => f.q);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("construit le balisage FAQPage à partir du texte affiché", () => {
    // Un balisage qui ne correspond pas au contenu visible est une cause
    // classique de sanction manuelle Google.
    const jsonLd = faqJsonLd();
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(FAQS.length);
    for (const [index, entity] of jsonLd.mainEntity.entries()) {
      expect(entity.name).toBe(FAQS[index].q);
      expect(entity.acceptedAnswer.text).toBe(FAQS[index].a);
    }
  });

  it("ne présente pas la rééducation comme un substitut à la pression positive continue", () => {
    const substitution = FAQS.find((f) => /remplace/i.test(f.q));
    expect(substitution).toBeDefined();
    expect(substitution!.a).toMatch(/^Non/);
  });
});
