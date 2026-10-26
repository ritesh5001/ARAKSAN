import { JsonLd } from "@/components/JsonLd";
import { PRODUCTIONS_NAME } from "@/components/ProductionsLogo";
import { RevealObserver } from "@/components/RevealObserver";
import { Productions } from "@/components/sections/Productions";
import { getContent } from "@/lib/content";
import { resolveLocale } from "@/lib/locale-params";
import { href, t } from "@/lib/i18n";
import { pageMetadata, personName, siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/productions">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/productions", seo.productions);
}

export default async function ProductionsPage({ params }: PageProps<"/[lang]/productions">) {
  const locale = await resolveLocale(params);
  const content = await getContent();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: PRODUCTIONS_NAME,
          slogan: "Seeing the beauty",
          url: `${siteUrl}${href(locale, "/productions")}`,
          logo: `${siteUrl}/brand/arag-san-productions.svg`,
          founder: { "@type": "Person", name: personName, url: `${siteUrl}${href(locale)}` },
          description: t(content.seo.productions.description, locale),
        }}
      />
      <Productions locale={locale} productions={content.productions} />
      <RevealObserver />
    </>
  );
}
