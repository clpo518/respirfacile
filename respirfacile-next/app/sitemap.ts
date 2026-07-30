import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap généré depuis PUBLIC_ROUTES, jamais écrit à la main.
 * Une route ajoutée sans passer par lib/routes.ts n'apparaîtra pas ici, et le
 * test associé le signalera.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.filter((route) => route.indexable).map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
