/**
 * Source unique de vérité pour l'identité du site.
 *
 * L'URL est pilotée par NEXT_PUBLIC_APP_URL pour que les canonical, le sitemap
 * et les JSON-LD pointent vers le domaine réellement servi. Tant que
 * respirfacile.fr n'est pas branché, Vercel sert le site sur son propre
 * domaine : la variable d'environnement évite de déclarer des canonical vers
 * un domaine qui ne résout pas.
 */

const FALLBACK_URL = "https://respirfacile.fr";

function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

export const siteUrl = normalize(
  process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : FALLBACK_URL),
);

export const siteName = "Respirfacile";

/** Adresse de contact unique. Ne jamais introduire de variante nominative. */
export const contactEmail = "contact@respirfacile.fr";

/** Éditeur légal (identique à ParlerMoinsVite, même société). */
export const legalEntity = {
  name: "POCLE SAS",
  address: "21 B Rue du Simplon, 75018 Paris",
  rcs: "RCS Paris 847 536 711",
  vat: "TVA FR70847536711",
  publicationDirector: "Clément",
};

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
