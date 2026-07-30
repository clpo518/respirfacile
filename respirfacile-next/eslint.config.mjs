import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Le français est plein d'apostrophes. Cette règle transforme chaque
      // « l'application » en erreur alors que React échappe correctement le
      // caractère. Désactivée volontairement, pas par facilité.
      "react/no-unescaped-entities": "off",

      // DETTE ASSUMÉE, à rembourser.
      // Les lignes Supabase ne sont pas typées (types générés absents), d'où
      // une quarantaine de `any`. Ramené en avertissement pour que le lint
      // reste bloquant sur le reste, sans masquer le sujet. À repasser en
      // erreur une fois `supabase gen types` intégré au projet.
      "@typescript-eslint/no-explicit-any": "warn",

      // DETTE ASSUMÉE, à rembourser.
      // Règles du compilateur React introduites avec Next 16. Elles pointent
      // du vrai (Math.random et Date.now appelés pendant le rendu, effets qui
      // posent un state, composants déclarés dans le rendu). Le chantier est
      // réel mais transverse : signalé en avertissement plutôt qu'ignoré.
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
