import { RevealObserver } from "@/components/RevealObserver";
import { Consulting } from "@/components/sections/Consulting";
import { getContent } from "@/lib/content";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/consulting">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/consulting", seo.consulting);
}

export default async function ConsultingPage({ params }: PageProps<"/[lang]/consulting">) {
  const locale = await resolveLocale(params);
  const content = await getContent();

  return (
    <>
      <Consulting locale={locale} consulting={content.consulting} />
      <RevealObserver />
    </>
  );
}
