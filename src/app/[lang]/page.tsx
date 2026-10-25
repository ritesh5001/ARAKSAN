import { JsonLd } from "@/components/JsonLd";
import { RevealObserver } from "@/components/RevealObserver";
import { About } from "@/components/sections/About";
import { Consulting } from "@/components/sections/Consulting";
import { Contact } from "@/components/sections/Contact";
import { Hero, Paths } from "@/components/sections/Hero";
import { Productions } from "@/components/sections/Productions";
import { getContent } from "@/lib/content";
import { href, t } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata, personName, siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/", seo.home, { absoluteTitle: true });
}

// The whole site is one page: Hero → About → Consulting → Productions → Contact.
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params);
  const content = await getContent();
  const { home, about, consulting, productions, contact, settings, navigation } = content;
  const email = settings.showEmail && settings.email ? settings.email : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: personName,
          jobTitle: t(home.roles, locale).split("|").map((s) => s.trim()),
          description: t(home.intro, locale),
          url: `${siteUrl}${href(locale)}`,
          image: `${siteUrl}${home.portrait.src}`,
          ...(email ? { email: `mailto:${email}` } : {}),
        }}
      />
      <Hero locale={locale} home={home} />
      <Paths locale={locale} home={home} />
      <About locale={locale} about={about} />
      <Consulting locale={locale} consulting={consulting} />
      <Productions locale={locale} productions={productions} />
      <Contact locale={locale} contact={contact} privacyLabel={navigation.privacy} email={email} />
      {/* Rendered inside the page so it starts only after this content has hydrated. */}
      <RevealObserver />
    </>
  );
}
