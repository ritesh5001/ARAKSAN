import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Prose, Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { href, t, type Locale } from "@/lib/i18n";

const index = (i: number) => String(i + 1).padStart(2, "0");

export function Consulting({ locale, consulting }: { locale: Locale; consulting: SiteContent["consulting"] }) {
  const [firstParagraph, ...rest] = t(consulting.intro, locale).split(/\n\s*\n/);

  return (
    <section
      id="consulting"
      data-section
      aria-labelledby="consulting-title"
      className="relative isolate overflow-hidden bg-ivory pt-36 pb-28 md:pt-48 md:pb-40"
    >
      {/* Contours at roughly natural scale behind the opening, fading into the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[52rem] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <Texture name="contours" className="object-right opacity-90" />
      </div>

      <div className="shell">
        <header className="max-w-5xl">
          <p className="eyebrow reveal text-bronze-ink">{t(consulting.title, locale)}</p>
          <h1 id="consulting-title" className="words mt-8 font-display text-display font-light text-balance">
            <Words text={t(consulting.lead, locale)} />
          </h1>
          <p className="reveal mt-8 font-display text-standfirst text-ink-soft italic">
            {t(consulting.supporting, locale)}
          </p>
        </header>

        <span aria-hidden="true" className="reveal-line mt-16 block h-px bg-charcoal md:mt-24" />
        <div className="grid-12 gap-y-8 pt-12 md:pt-16">
          <p className="reveal col-span-12 font-display text-standfirst lg:col-span-6">{firstParagraph}</p>
          {rest.length > 0 && (
            <Prose text={rest.join("\n\n")} reveal className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-1" />
          )}
        </div>

        {/* Two practice areas with equal weight */}
        <ol className="mt-20 grid gap-6 md:mt-28 md:grid-cols-2 md:gap-8">
          {consulting.areas.map((area, i) => (
            <li key={i} className="reveal" style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}>
              <div className="group relative flex h-full flex-col border-t-2 border-charcoal bg-ivory/80 p-8 backdrop-blur-[2px] transition-[translate,box-shadow,background-color] duration-700 ease-[var(--ease-expo)] hover:-translate-y-1.5 hover:bg-ivory hover:shadow-[0_40px_70px_-40px_rgb(28_27_25/0.35)] md:p-12">
                {/* Bronze rule that draws over the charcoal one on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -top-0.5 h-0.5 origin-left scale-x-0 bg-bronze transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
                />
                <span className="eyebrow text-bronze-ink">{index(i)}</span>
                <h2 className="mt-6 font-display text-title">{t(area.title, locale)}</h2>
                <p className="mt-6 text-ink-soft">{t(area.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Practical applications beside a quiet working image */}
        <div className="grid-12 mt-24 items-center gap-y-12 md:mt-36">
          {consulting.image.src && (
            <figure className="col-span-12 lg:col-span-5">
              <div className="reveal-image hover-zoom relative aspect-[4/3] overflow-hidden bg-cream">
                <Image
                  src={consulting.image.src}
                  alt={t(consulting.image.alt, locale)}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </figure>
          )}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <h2 className="reveal font-display text-title">{t(consulting.applications.title, locale)}</h2>
            {t(consulting.applications.intro, locale) && (
              <p className="reveal mt-3 text-ink-soft">{t(consulting.applications.intro, locale)}</p>
            )}
            <ul className="mt-8">
              {consulting.applications.items.map((item, i) => (
                <li
                  key={i}
                  className="reveal group relative flex items-baseline gap-6 border-b border-line py-5 first:border-t"
                  style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                >
                  <span className="eyebrow w-6 shrink-0 text-bronze-ink transition-colors duration-500 group-hover:text-bronze">
                    {index(i)}
                  </span>
                  <span className="font-display text-[1.45rem] leading-snug transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2 md:text-[1.7rem]">
                    {t(item, locale)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-bronze transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
                  />
                </li>
              ))}
            </ul>
            <Link
              href={href(locale, "/contact")}
              className="arrow-link reveal mt-12 inline-flex border-b border-charcoal pb-2 font-display text-[1.6rem] hover:text-bronze-ink"
            >
              {t(consulting.cta, locale)}
              <Arrow className="text-bronze" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
