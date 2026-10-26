import { RevealObserver } from "@/components/RevealObserver";
import { Productions } from "@/components/sections/Productions";
import { getContent } from "@/lib/content";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata } from "@/lib/site";

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
      <Productions locale={locale} productions={content.productions} />
      <RevealObserver />
    </>
  );
}
