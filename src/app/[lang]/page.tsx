import { JsonLd } from "@/components/JsonLd";
import { RevealObserver } from "@/components/RevealObserver";
import { AboutIntro } from "@/components/sections/About";
import { Hero, Paths } from "@/components/sections/Hero";
import { getContent } from "@/lib/content";
import { href, t } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata, personName, siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/", seo.home, { absoluteTitle: true });
}

// Home: one image, one clear statement, and equal paths to Consulting and Productions.
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params);
  const { home, about, settings } = await getContent();
  const email = settings.showEmail && settings.email ? settings.email : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: personName,
          jobTitle: t(home.roles, locale)
            .split("|")
            .map((s) => s.trim()),
          description: t(home.intro, locale),
          url: `${siteUrl}${href(locale)}`,
          image: `${siteUrl}${home.portrait.src}`,
          ...(email ? { email: `mailto:${email}` } : {}),
        }}
      />
      <Hero locale={locale} home={home} />
      <Paths locale={locale} home={home} />
      <AboutIntro locale={locale} about={about} cta={t(home.aboutCta, locale)} />
      {/* Rendered inside the page so it starts only after this content has hydrated. */}
      <RevealObserver />
    </>
  );
}
