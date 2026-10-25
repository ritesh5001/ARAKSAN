export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Localized = Record<Locale, string>;

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function t(value: Localized, locale: Locale): string {
  return value[locale] || value[defaultLocale];
}

/** Path for a page in a given locale, e.g. href("fr", "/about") -> "/fr/about". */
export function href(locale: Locale, path = "/"): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export const htmlLang: Record<Locale, string> = { en: "en", fr: "fr" };
export const ogLocale: Record<Locale, string> = { en: "en_GB", fr: "fr_FR" };
