import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./i18n";

/** Resolves the [lang] route param, returning a 404 for unsupported locales. */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}
