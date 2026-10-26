import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { publishedEssays } from "@/lib/essays";
import { href, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const paths = ["/", "/about", "/consulting", "/productions", "/contact", "/privacy"];
  if (content.settings.perspectivesEnabled) {
    paths.push("/perspectives", ...publishedEssays(content).map((e) => `/perspectives/${e.slug}`));
  }

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}${href(locale, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}${href(l, path)}`])),
      },
    })),
  );
}
