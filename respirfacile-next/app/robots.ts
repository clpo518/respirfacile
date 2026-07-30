import type { MetadataRoute } from "next";
import { DISALLOWED_PREFIXES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PREFIXES,
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
