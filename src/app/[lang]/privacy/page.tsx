import { Prose } from "@/components/RichText";
import { getContent } from "@/lib/content";
import { t } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/privacy", seo.privacy);
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const locale = await resolveLocale(params);
  const { privacy } = await getContent();

  return (
    <article className="shell pt-36 pb-28 md:pt-44 md:pb-40">
      <div className="mx-auto max-w-[40rem]">
        <h1 className="hero-in font-display text-headline font-light">{t(privacy.title, locale)}</h1>
        <span aria-hidden="true" className="mt-10 mb-14 block h-px w-16 bg-bronze" />
        <Prose text={t(privacy.body, locale)} marked="heading" />
      </div>
    </article>
  );
}
