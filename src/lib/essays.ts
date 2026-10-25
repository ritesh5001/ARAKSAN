import type { SiteContent } from "./content-types";
import type { Locale } from "./i18n";

/** Essays visible to the public: the section is switched on and the essay is published. */
export function publishedEssays(content: SiteContent) {
  if (!content.settings.perspectivesEnabled) return [];
  return content.perspectives.essays
    .filter((e) => e.published && e.slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(date: string, locale: Locale) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
