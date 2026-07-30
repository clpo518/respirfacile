import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DISALLOWED_PREFIXES, PUBLIC_ROUTES } from "@/lib/routes";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const appDir = path.resolve(__dirname, "..", "app");

describe("inventaire des routes publiques", () => {
  it("ne déclare aucune route en double", () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("ne déclare que des pages qui existent réellement", () => {
    // Garde-fou contre un sitemap qui promettrait des 404 à Google.
    for (const route of PUBLIC_ROUTES) {
      const segment = route.path === "/" ? "" : route.path.replace(/^\//, "");
      const pageFile = path.join(appDir, segment, "page.tsx");
      expect(existsSync(pageFile), route.path).toBe(true);
    }
  });
});

describe("sitemap", () => {
  it("n'expose que les routes marquées indexables", () => {
    const urls = sitemap().map((entry) => entry.url);
    const expected = PUBLIC_ROUTES.filter((r) => r.indexable);
    expect(urls).toHaveLength(expected.length);
    for (const route of expected) {
      expect(urls.some((url) => url.endsWith(route.path === "/" ? "" : route.path))).toBe(true);
    }
  });

  it("produit des URL absolues", () => {
    for (const entry of sitemap()) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });

  it("laisse les espaces authentifiés hors du sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const prefix of ["/dashboard", "/therapist", "/api/", "/session"]) {
      expect(urls.some((url) => url.includes(prefix)), prefix).toBe(false);
    }
  });
});

describe("robots", () => {
  it("interdit les espaces contenant des données de santé", () => {
    const rules = robots().rules;
    const disallow = Array.isArray(rules) ? [] : (rules.disallow as string[]);
    for (const prefix of ["/api/", "/dashboard", "/therapist", "/journal"]) {
      expect(disallow, prefix).toContain(prefix);
    }
    expect(disallow).toEqual(DISALLOWED_PREFIXES);
  });

  it("déclare le sitemap", () => {
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
