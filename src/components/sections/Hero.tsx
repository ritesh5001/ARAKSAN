import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { href, t, type Locale } from "@/lib/i18n";

const delay = (ms: number) => ({ "--hero-delay": `${ms}ms` }) as React.CSSProperties;

export function Hero({ locale, home }: { locale: Locale; home: SiteContent["home"] }) {
  const roles = t(home.roles, locale)
    .split("|")
    .map((r) => r.trim());

  return (
    <section id="top" data-section className="relative isolate overflow-hidden bg-ivory">
      <Texture name="paper" className="-z-20 opacity-60" />

      <div className="shell grid-12 items-center gap-y-12 pt-28 pb-20 md:pt-32 lg:min-h-svh lg:pt-28 lg:pb-24">
        <div className="order-2 col-span-12 lg:order-1 lg:col-span-7 xl:col-span-6">
          <p className="hero-in eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-bronze-ink">
            {roles.map((role, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-bronze" />}
                {role}
              </span>
            ))}
          </p>
          <h1
            className="words words-load mt-6 font-display text-display font-light tracking-[-0.01em] text-balance"
            style={{ "--words-delay": "150ms" } as React.CSSProperties}
          >
            <Words text={t(home.headline, locale)} />
          </h1>
          <p
            className="hero-in mt-8 max-w-[32ch] text-[1.15rem] leading-relaxed text-ink-soft md:text-[1.3rem]"
            style={delay(650)}
          >
            {t(home.intro, locale)}
          </p>
          <div className="hero-in mt-12 flex flex-wrap items-center gap-x-10 gap-y-6" style={delay(850)}>
            <Link
              href={href(locale, "/contact")}
              className="btn-sweep arrow-link eyebrow bg-charcoal px-7 py-4 text-ivory"
            >
              {t(home.cta, locale)}
              <Arrow />
            </Link>
            <p className="font-display text-[1.4rem] leading-tight">{home.name}</p>
          </div>
        </div>

        {/* Her approved portrait, framed and uncropped at the face: never behind text. */}
        {home.portrait.src && (
          <figure className="relative order-1 col-span-12 mx-auto w-full max-w-md sm:max-w-lg lg:order-2 lg:col-span-5 lg:col-start-8 lg:max-w-none">
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 border border-bronze/50 md:translate-x-6 md:translate-y-6"
            />
            <div className="image-settle relative aspect-[4/5] overflow-hidden bg-cream">
              <div data-parallax="0.06" className="absolute inset-0 lg:-inset-y-[5%]">
                <Image
                  src={home.portrait.src}
                  alt={t(home.portrait.alt, locale)}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1440px) 560px, (min-width: 1024px) 40vw, (min-width: 640px) 32rem, 100vw"
                  className="object-cover object-[50%_25%]"
                />
              </div>
            </div>
          </figure>
        )}
      </div>
    </section>
  );
}

/** Two equal doors into the two disciplines, directly under the hero. */
export function Paths({ locale, home }: { locale: Locale; home: SiteContent["home"] }) {
  const paths = [
    { id: "consulting", n: "01", data: home.consulting },
    { id: "productions", n: "02", data: home.productions },
  ];
  return (
    <nav
      id="paths"
      aria-label={paths.map((p) => t(p.data.title, locale)).join(", ")}
      className="border-y border-line bg-ivory"
    >
      <ul className="shell grid md:grid-cols-2">
        {paths.map((p, i) => (
          <li key={p.id} className={i === 1 ? "border-t border-line md:border-t-0 md:border-l" : ""}>
            <Link
              href={href(locale, `/${p.id}`)}
              className="group fill-rise reveal flex h-full items-start gap-6 px-1 py-10 md:px-10 md:py-14"
              style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}
            >
              <span className="eyebrow pt-3 text-bronze-ink transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-1">
                {p.n}
              </span>
              <span className="flex-1 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2">
                <span className="block font-display text-title transition-colors duration-500 group-hover:text-bronze-ink">
                  {t(p.data.title, locale)}
                </span>
                <span className="mt-2 block font-display text-[1.2rem] text-ink-soft italic">
                  {t(p.data.line, locale)}
                </span>
              </span>
              <span className="arrow-link pt-4 text-bronze-ink">
                <Arrow className="rotate-90 md:rotate-0" />
                <span className="sr-only">{t(p.data.cta, locale)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
