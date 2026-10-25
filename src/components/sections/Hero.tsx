import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { t, type Locale } from "@/lib/i18n";

const delay = (ms: number) => ({ "--hero-delay": `${ms}ms` }) as React.CSSProperties;

export function Hero({ locale, home }: { locale: Locale; home: SiteContent["home"] }) {
  const roles = t(home.roles, locale)
    .split("|")
    .map((r) => r.trim());

  return (
    <section id="top" data-section className="relative isolate overflow-hidden bg-ivory lg:min-h-svh">
      <Texture name="paper" className="-z-20" />

      {/* Mobile: image above the text. Desktop: full-bleed behind it. */}
      <div className="image-settle relative -z-10 h-[64svh] min-h-[26rem] overflow-hidden lg:absolute lg:inset-0 lg:h-auto">
        {home.portrait.src && (
          <div data-parallax="0.12" className="absolute inset-0 lg:-inset-y-[9%]">
            <Image
              src={home.portrait.src}
              alt={t(home.portrait.alt, locale)}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[80%_30%] lg:object-[70%_12%]"
            />
          </div>
        )}
        {/* Keeps the menu legible over the photo while the header is transparent. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 hidden h-40 bg-gradient-to-b from-ivory/85 to-transparent lg:block"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/10 to-transparent lg:bg-gradient-to-r lg:from-ivory lg:from-20% lg:via-ivory/70 lg:via-40% lg:to-transparent lg:to-62%"
        />
      </div>

      <div className="shell relative flex flex-col pb-20 lg:min-h-svh lg:justify-center lg:pt-32 lg:pb-28">
        <div className="-mt-24 max-w-[40rem] lg:mt-0">
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
            <Link href="#contact" className="btn-sweep arrow-link eyebrow bg-charcoal px-7 py-4 text-ivory">
              {t(home.cta, locale)}
              <Arrow />
            </Link>
            <p className="font-display text-[1.4rem] leading-tight">{home.name}</p>
          </div>
        </div>
      </div>

      <a
        href="#paths"
        aria-hidden="true"
        tabIndex={-1}
        className="scroll-cue absolute bottom-8 left-1/2 hidden h-14 w-px -translate-x-1/2 overflow-hidden bg-charcoal/15 lg:block"
      />
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
              href={`#${p.id}`}
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
              <span className="arrow-link pt-4 text-bronze">
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
