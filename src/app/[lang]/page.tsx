import { JsonLd } from "@/components/JsonLd";
import { RevealObserver } from "@/components/RevealObserver";
import { ClosingLine } from "@/components/sections/About";
import { AboutIntro, ConsultingPreview, ContactBand, ProductionsPreview } from "@/components/sections/HomeSections";
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

// Home: one image, one clear statement and equal paths to both disciplines,
// followed by an overview of each page in her approved words.
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params);
  const { home, about, consulting, productions, navigation, settings } = await getContent();
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
      <ClosingLine locale={locale} about={about} />
      <ConsultingPreview locale={locale} consulting={consulting} cta={t(home.consulting.cta, locale)} />
      <ProductionsPreview locale={locale} productions={productions} cta={t(home.productions.cta, locale)} />
      <ContactBand locale={locale} heading={t(home.cta, locale)} label={t(navigation.contact, locale)} />
      {/* Rendered inside the page so it starts only after this content has hydrated. */}
      <RevealObserver />
    </>
  );
}
