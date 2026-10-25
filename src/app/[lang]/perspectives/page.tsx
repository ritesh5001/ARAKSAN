import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { RevealObserver } from "@/components/RevealObserver";
import { getContent } from "@/lib/content";
import { formatDate, publishedEssays } from "@/lib/essays";
import { href, t } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale-params";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/perspectives">) {
  const locale = await resolveLocale(params);
  const { seo } = await getContent();
  return pageMetadata(locale, "/perspectives", seo.perspectives);
}

// Hidden until switched on in the admin panel (Settings → Perspectives enabled).
export default async function PerspectivesPage({ params }: PageProps<"/[lang]/perspectives">) {
  const locale = await resolveLocale(params);
  const content = await getContent();
  if (!content.settings.perspectivesEnabled) notFound();

  const { perspectives } = content;
  const essays = publishedEssays(content);

  return (
    <div className="shell pt-36 pb-28 md:pt-44 md:pb-40">
      <header className="mx-auto max-w-4xl border-b border-line pb-16 text-center md:pb-24">
        <h1 className="hero-in font-display text-display font-light">{t(perspectives.title, locale)}</h1>
        <p
          className="hero-in mt-8 font-display text-standfirst text-ink-soft italic"
          style={{ "--hero-delay": "150ms" } as React.CSSProperties}
        >
          {t(perspectives.lead, locale)}
        </p>
      </header>

      <ol className="mx-auto max-w-4xl">
        {essays.map((essay) => (
          <li key={essay.slug} className="reveal border-b border-line">
            <Link
              href={href(locale, `/perspectives/${essay.slug}`)}
              className="group grid gap-4 py-12 md:grid-cols-[10rem_1fr] md:gap-10 md:py-16"
            >
              <time dateTime={essay.date} className="eyebrow pt-2 text-bronze-ink">
                {formatDate(essay.date, locale)}
              </time>
              <span>
                <span className="block font-display text-title group-hover:text-bronze-ink">{t(essay.title, locale)}</span>
                <span className="mt-4 block text-ink-soft">{t(essay.summary, locale)}</span>
                <span className="arrow-link eyebrow mt-8 text-charcoal">
                  {t(perspectives.readLabel, locale)}
                  <Arrow />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <RevealObserver />
    </div>
  );
}
