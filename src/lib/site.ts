import type { Metadata } from "next";
import { href, locales, ogLocale, t, type Locale } from "./i18n";
import type { PageSeo } from "./content-types";

export const siteUrl = (process.env.SITE_URL || "https://araksan.com").replace(/\/$/, "");
export const isProduction = process.env.SITE_ENV === "production";
export const personName = "Araksan Idriss Omar";


/** Title, description, canonical URL, hreflang alternates and Open Graph for one page. */
export function pageMetadata(locale: Locale, path: string, seo: PageSeo, opts: { absoluteTitle?: boolean } = {}): Metadata {
  const title = t(seo.title, locale);
  const description = t(seo.description, locale);
  const languages = Object.fromEntries(locales.map((l) => [l, href(l, path)]));
  // Set explicitly: a page-level openGraph replaces the image inherited from
  // app/[lang]/opengraph-image.tsx.
  const images = [{ url: href(locale, "/opengraph-image"), width: 1200, height: 630, alt: personName }];

  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: href(locale, path),
      languages: { ...languages, "x-default": href("en", path) },
    },
    openGraph: {
      type: "website",
      siteName: personName,
      title: opts.absoluteTitle ? title : `${title} — ${personName}`,
      description,
      url: href(locale, path),
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
