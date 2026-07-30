/**
 * Inventaire des routes publiques du site.
 *
 * Source unique pour le sitemap et le robots.txt. Toute nouvelle page publique
 * doit être déclarée ici, sinon elle n'est pas soumise à l'indexation.
 * Les espaces authentifiés (patient, praticien, API) sont listés séparément
 * pour être explicitement interdits aux robots : ils contiennent des données
 * de santé et n'ont rien à faire dans un index.
 */

export interface PublicRoute {
  path: string;
  /** false = la page existe mais reste hors index (contenu vide, page de compte). */
  indexable: boolean;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", indexable: true, changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", indexable: true, changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", indexable: true, changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", indexable: true, changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", indexable: true, changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", indexable: true, changeFrequency: "yearly", priority: 0.3 },
  { path: "/mentions-legales", indexable: true, changeFrequency: "yearly", priority: 0.3 },
  // Aucun article publié pour l'instant : la page reste accessible mais hors index.
  { path: "/blog", indexable: false, changeFrequency: "monthly", priority: 0.4 },
  // Page de connexion : sans intérêt pour un moteur, et source de doublons.
  { path: "/auth", indexable: false, changeFrequency: "yearly", priority: 0.1 },
];

/** Préfixes interdits aux robots : données de santé ou pages de compte. */
export const DISALLOWED_PREFIXES = [
  "/api/",
  "/dashboard",
  "/therapist",
  "/patient",
  "/session",
  "/journal",
  "/history",
  "/exercises",
  "/ressources",
  "/profile",
  "/settings",
  "/onboarding",
  "/admin",
  "/reset-password",
  "/auth",
];
