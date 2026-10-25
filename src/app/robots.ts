import type { MetadataRoute } from "next";
import { isProduction, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Staging and local builds must never be crawled.
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/media/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
