import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader, type NavItem } from "@/components/SiteHeader";
import { getContent } from "@/lib/content";
import { hasLocale, href, htmlLang, locales, t, type Locale } from "@/lib/i18n";
import { isProduction, personName, siteUrl } from "@/lib/site";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: personName, template: `%s — ${personName}` },
  // Staging and local builds are never indexed; only SITE_ENV=production is.
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
};

async function getNavigation(locale: Locale) {
  const content = await getContent();
  const nav = content.navigation;
  const section = (id: "about" | "consulting" | "productions" | "contact"): NavItem => ({
    href: `${href(locale)}#${id}`,
    label: t(nav[id], locale),
    section: id,
  });
  const items: NavItem[] = [
    section("about"),
    section("consulting"),
    section("productions"),
    ...(content.settings.perspectivesEnabled
      ? [{ href: href(locale, "/perspectives"), label: t(nav.perspectives, locale) }]
      : []),
    section("contact"),
  ];
  return { content, items };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { content, items } = await getNavigation(lang);
  const nav = content.navigation;
  const email = content.settings.showEmail && content.settings.email ? content.settings.email : null;

  return (
    // suppressHydrationWarning: the inline script below adds a class to <html> before React hydrates.
    <html lang={htmlLang[lang]} className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables the reveal animations before first paint. If the app's JavaScript
            never starts (blocked or failed), everything is shown after 2.5 s
            rather than staying hidden. RevealObserver (rendered by each
            page that uses reveals) sets __revealReady. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-reveal');setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove('js-reveal')},2500)",
          }}
        />
      </head>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="eyebrow fixed top-3 left-3 z-[60] -translate-y-24 bg-charcoal px-4 py-3 text-ivory focus:translate-y-0"
        >
          {t(nav.skipToContent, lang)}
        </a>
        <SiteHeader
          locale={lang}
          items={items}
          labels={{
            menu: t(nav.menu, lang),
            close: t(nav.close, lang),
            language: t(nav.language, lang),
            home: t(nav.home, lang),
          }}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter
          home={href(lang)}
          items={items}
          privacy={{ href: href(lang, "/privacy"), label: t(nav.privacy, lang) }}
          email={email}
          rights={t(nav.rights, lang)}
        />
      </body>
    </html>
  );
}
