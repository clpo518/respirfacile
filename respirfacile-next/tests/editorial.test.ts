import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Garde-fous éditoriaux, appliqués aux surfaces vues par un utilisateur.
 *
 * Ces règles viennent de parlermoinsvite et se reperdaient à chaque nouvelle
 * page. Un test les rend opposables : la relecture humaine ne rattrape pas un
 * « nous » glissé dans un composant six mois plus tard.
 *
 * Les vérifications portent sur les PHRASES affichées, pas sur le code : un
 * identifiant `features` ou une valeur d'union `"apnees"` ne sont pas du texte.
 */

const ROOT = path.resolve(__dirname, "..");

const SCANNED_DIRS = ["components/landing", "components/journal", "lib/content"];

const SCANNED_FILES = [
  "app/page.tsx",
  "app/about/page.tsx",
  "app/contact/page.tsx",
  "app/pricing/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/mentions-legales/page.tsx",
  "components/auth/AuthForm.tsx",
  "components/StreakDisplay.tsx",
];

function listFiles(): string[] {
  const files = [...SCANNED_FILES];
  for (const dir of SCANNED_DIRS) {
    const full = path.join(ROOT, dir);
    for (const entry of readdirSync(full)) {
      const entryPath = path.join(full, entry);
      if (statSync(entryPath).isFile() && /\.(ts|tsx)$/.test(entry)) {
        files.push(path.join(dir, entry));
      }
    }
  }
  return files;
}

/** Retire les commentaires : ils expliquent souvent la règle qu'ils citent. */
function stripComments(raw: string): string {
  return raw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/**
 * Phrases affichées : littéraux de chaîne contenant au moins une espace, et
 * texte JSX entre deux balises. Un mot isolé entre guillemets est un
 * identifiant, pas une phrase.
 */
function displayedSentences(relativePath: string): string[] {
  const source = stripComments(readFileSync(path.join(ROOT, relativePath), "utf8"));
  const sentences: string[] = [];

  for (const match of source.matchAll(/"([^"\n]{4,})"|'([^'\n]{4,})'|`([^`]{4,})`/g)) {
    const value = match[1] ?? match[2] ?? match[3];
    if (value.includes(" ")) sentences.push(value);
  }
  for (const match of source.matchAll(/>([^<>{}]{4,})</g)) {
    const value = match[1].trim();
    if (value.includes(" ")) sentences.push(value);
  }

  return sentences;
}

const FILES = listFiles();
const SENTENCES: Array<{ file: string; text: string }> = FILES.flatMap((file) =>
  displayedSentences(file).map((text) => ({ file, text })),
);

interface Rule {
  name: string;
  pattern: RegExp;
  why: string;
}

const RULES: Rule[] = [
  {
    name: "pas de « nous » ni de « notre équipe », Clément est seul",
    pattern:
      /\b(nous (?:avons|sommes|proposons|répondons|vous|pouvons)|contactez-nous|écrivez-nous|envoyez-nous|notre équipe)\b/i,
    why: "Aucune équipe ne doit être sous-entendue : c'est « je ».",
  },
  {
    // \p{L} évite que « kinésithérapeute » soit pris pour « kiné » : en regex
    // non unicode, l'accent casse la frontière de mot.
    name: "pas d'abréviation de profession",
    pattern: /(?<!\p{L})(ortho|orthos|kiné|kinés)(?!\p{L})/u,
    why: "On écrit « orthophoniste » et « kinésithérapeute » en toutes lettres.",
  },
  {
    name: "pas d'anglais ni d'abréviation opaque dans le texte",
    pattern: /\b(free trial|coming soon|(?:sans|pas de|votre|la) CB)\b/i,
    why: "Tout le texte visible est en français, sans abréviation obscure.",
  },
  {
    name: "pas de nom de famille",
    pattern: /Pontegnier/,
    why: "Toujours « Clément », ou « Clément, fondateur ».",
  },
  {
    name: "pas de promesse de résultat",
    pattern: /\b(garanti[es]?|garantit|garantissons|guérison|guérit)\b/i,
    why: "Aucune promesse de guérison ni de garantie sur un produit de santé.",
  },
  {
    name: "pas de tutoiement du patient adulte",
    pattern: /\b(tu peux|tes séances|ton programme|continue comme ça)\b/i,
    why: "L'interface patient adulte vouvoie, sans exception.",
  },
];

describe("règles éditoriales sur les surfaces visibles", () => {
  it("extrait bien des phrases à analyser", () => {
    expect(FILES.length).toBeGreaterThan(10);
    expect(SENTENCES.length).toBeGreaterThan(200);
  });

  for (const rule of RULES) {
    it(rule.name, () => {
      const offenders = SENTENCES.filter(({ text }) => rule.pattern.test(text)).map(
        ({ file, text }) => `${file} → « ${text.slice(0, 90)} »`,
      );
      expect(offenders, `${rule.why}\n${offenders.join("\n")}`).toEqual([]);
    });
  }
});

describe("les règles attrapent bien ce qu'elles visent", () => {
  // Un garde-fou qui ne se déclenche jamais ne prouve rien. Chaque règle est
  // confrontée à une phrase fautive et à une phrase correcte.
  const CASES: Array<{ rule: string; fautif: string; correct: string }> = [
    {
      rule: "pas de « nous » ni de « notre équipe », Clément est seul",
      fautif: "Nous répondons à tous les messages sous 24 heures.",
      correct: "Je réponds à tous les messages sous 24 heures.",
    },
    {
      rule: "pas d'abréviation de profession",
      fautif: "Votre ortho voit vos résultats.",
      correct: "Votre orthophoniste voit vos résultats, votre kinésithérapeute aussi.",
    },
    {
      rule: "pas d'anglais ni d'abréviation opaque dans le texte",
      fautif: "30 jours gratuits, sans CB.",
      correct: "30 jours gratuits, sans carte bancaire.",
    },
    {
      rule: "pas de nom de famille",
      fautif: "Clément Pontegnier, fondateur",
      correct: "Clément, fondateur",
    },
    {
      rule: "pas de promesse de résultat",
      fautif: "C'est exactement ce que Respirfacile garantit.",
      correct: "C'est précisément là que Respirfacile intervient.",
    },
    {
      rule: "pas de tutoiement du patient adulte",
      fautif: "Tu peux faire ta séance ce soir.",
      correct: "Vous pouvez faire votre séance ce soir.",
    },
  ];

  for (const { rule, fautif, correct } of CASES) {
    it(`détecte la faute pour : ${rule}`, () => {
      const definition = RULES.find((r) => r.name === rule);
      expect(definition, `règle absente : ${rule}`).toBeDefined();
      expect(definition!.pattern.test(fautif)).toBe(true);
      expect(definition!.pattern.test(correct)).toBe(false);
    });
  }
});

describe("accents", () => {
  // Des pages entières sans accents avaient échappé à toutes les relectures.
  const UNACCENTED = [
    "seance", "seances", "reeducation", "apnee", "apnees", "deja",
    "controlee", "donnees", "regularite", "resultat", "resultats",
    "prenom", "acces", "caracteres", "kinesitherapeute", "oublie",
    "medecin", "probleme", "reponse", "reponses", "creer",
  ];

  it("n'affiche aucun mot français désaccentué", () => {
    const offenders: string[] = [];
    for (const { file, text } of SENTENCES) {
      for (const word of UNACCENTED) {
        if (new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, "iu").test(text)) {
          offenders.push(`${file} → « ${word} » dans « ${text.slice(0, 70)} »`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
