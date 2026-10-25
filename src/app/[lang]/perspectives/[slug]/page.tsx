import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/RichText";
import { getContent } from "@/lib/content";
import { formatDate, publishedEssays } from "@/lib/essays";
import { hasLocale, href, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  const essays = publishedEssays(await getContent());
  // Cache Components needs at least one value per param to prerender; the
  // placeholder slug simply resolves to a 404.
  return essays.length ? essays.map((e) => ({ slug: e.slug })) : [{ slug: "_" }];
}

async function findEssay(params: PageProps<"/[lang]/perspectives/[slug]">["params"]) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const essay = publishedEssays(await getContent()).find((e) => e.slug === slug);
  if (!essay) notFound();
  return { locale: lang, essay };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/perspectives/[slug]">) {
  const { locale, essay } = await findEssay(params);
  const meta = pageMetadata(locale, `/perspectives/${essay.slug}`, { title: essay.title, description: essay.summary });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" as const, publishedTime: essay.date } };
}

export default async function EssayPage({ params }: PageProps<"/[lang]/perspectives/[slug]">) {
  const { locale, essay } = await findEssay(params);
  const { perspectives } = await getContent();

  return (
    <article className="shell pt-36 pb-28 md:pt-44 md:pb-40">
      <div className="mx-auto max-w-[40rem]">
        <Link href={href(locale, "/perspectives")} className="eyebrow link-underline text-bronze-ink">
          ← {t(perspectives.backLabel, locale)}
        </Link>
        <time dateTime={essay.date} className="eyebrow mt-14 block text-ink-soft">
          {formatDate(essay.date, locale)}
        </time>
        <h1 className="mt-6 font-display text-headline font-light text-balance">{t(essay.title, locale)}</h1>
        <p className="mt-8 font-display text-standfirst text-ink-soft italic">{t(essay.summary, locale)}</p>
        <span aria-hidden="true" className="mt-12 mb-14 block h-px w-16 bg-bronze" />
        <Prose text={t(essay.body, locale)} />
      </div>
    </article>
  );
}
