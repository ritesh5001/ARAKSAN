import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { href, t, type Locale } from "@/lib/i18n";

// Home page overviews. Every sentence here is her approved copy, drawn from the
// About, Consulting and Productions pages; each overview leads to its full page.

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

function MoreLink({ to, label, tone = "light" }: { to: string; label: string; tone?: "light" | "dark" }) {
  return (
    <Link
      href={to}
      className={`arrow-link reveal eyebrow inline-flex ${tone === "dark" ? "text-ivory" : "text-charcoal"}`}
    >
      <span className="link-underline pb-1">{label}</span>
      <Arrow className={tone === "dark" ? "text-bronze-light" : "text-bronze-ink"} />
    </Link>
  );
}

/** Her opening line beside the first part of her story. */
export function AboutIntro({ locale, about, cta }: { locale: Locale; about: SiteContent["about"]; cta: string }) {
  // The first two plain paragraphs (pivot lines starting with "> " are kept for the About page).
  const opening = paragraphs(t(about.body, locale))
    .filter((p) => !p.startsWith("> "))
    .slice(0, 2);

  return (
    <section aria-labelledby="home-about-title" className="relative isolate overflow-hidden bg-ivory py-28 md:py-40">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[42rem] [mask-image:linear-gradient(to_bottom,black_35%,transparent)]"
      >
        <Texture name="horizon" className="object-[50%_70%] opacity-70" />
      </div>
      <div className="shell grid-12 gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <p className="eyebrow reveal text-bronze-ink">{t(about.title, locale)}</p>
          <h2 id="home-about-title" className="words mt-8 font-display text-headline font-light text-balance">
            <Words text={t(about.lead, locale)} />
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-16">
          {opening.map((p, i) => (
            <p key={i} className="reveal mb-6 text-ink-soft" style={delay(i * 120)}>
              {p}
            </p>
          ))}
          <div className="mt-10">
            <MoreLink to={href(locale, "/about")} label={cta} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Consulting at a glance: the approach, the two practice areas and the applications. */
export function ConsultingPreview({
  locale,
  consulting,
  cta,
}: {
  locale: Locale;
  consulting: SiteContent["consulting"];
  cta: string;
}) {
  const [firstParagraph] = paragraphs(t(consulting.intro, locale));

  return (
    <section
      aria-labelledby="home-consulting-title"
      className="relative isolate overflow-hidden bg-ivory py-28 md:py-40"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[52rem] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <Texture name="contours" className="object-right opacity-80" />
      </div>

      <div className="shell">
        <div className="grid-12 items-center gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <p className="eyebrow reveal text-bronze-ink">{t(consulting.title, locale)}</p>
            <h2 id="home-consulting-title" className="words mt-8 font-display text-headline font-light text-balance">
              <Words text={t(consulting.lead, locale)} />
            </h2>
            <p className="reveal mt-6 font-display text-standfirst text-ink-soft italic">
              {t(consulting.supporting, locale)}
            </p>
            {firstParagraph && <p className="reveal mt-8 max-w-xl">{firstParagraph}</p>}
          </div>
          {consulting.image.src && (
            <figure className="col-span-12 lg:col-span-5 lg:col-start-8">
              <div className="reveal-image hover-zoom relative aspect-[4/3] overflow-hidden bg-cream">
                <Image
                  src={consulting.image.src}
                  alt={t(consulting.image.alt, locale)}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[62%_35%]"
                />
              </div>
            </figure>
          )}
        </div>

        <ol className="mt-20 grid gap-6 md:mt-28 md:grid-cols-2 md:gap-8">
          {consulting.areas.map((area, i) => (
            <li key={i} className="reveal" style={delay(i * 120)}>
              <div className="group relative flex h-full flex-col border-t-2 border-charcoal bg-ivory/85 p-8 backdrop-blur-[2px] transition-[translate,box-shadow,background-color] duration-700 ease-[var(--ease-expo)] hover:-translate-y-1.5 hover:bg-ivory hover:shadow-[0_40px_70px_-40px_rgb(28_27_25/0.35)] md:p-12">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -top-0.5 h-0.5 origin-left scale-x-0 bg-bronze transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
                />
                <span className="eyebrow text-bronze-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-title">{t(area.title, locale)}</h3>
                <p className="mt-6 text-ink-soft">{t(area.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 md:mt-20">
          <p className="eyebrow reveal text-ink-soft">
            {t(consulting.applications.title, locale)} · {t(consulting.applications.intro, locale)}
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {consulting.applications.items.map((item, i) => (
              <li
                key={i}
                className="reveal border border-line bg-ivory/80 px-5 py-3 font-display text-[1.2rem] leading-snug transition-colors duration-500 hover:border-bronze hover:text-bronze-ink md:text-[1.3rem]"
                style={delay(i * 60)}
              >
                {t(item, locale)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <MoreLink to={href(locale, "/consulting")} label={cta} />
        </div>
      </div>
    </section>
  );
}

/** Productions at a glance: every project as an image card. */
export function ProductionsPreview({
  locale,
  productions,
  cta,
}: {
  locale: Locale;
  productions: SiteContent["productions"];
  cta: string;
}) {
  return (
    <section
      data-section
      data-header="dark"
      aria-labelledby="home-productions-title"
      className="theme-night relative isolate overflow-hidden bg-night py-28 text-ivory md:py-40"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[48rem] [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
      >
        <Texture name="night" />
      </div>

      <div className="shell">
        <header className="mx-auto max-w-4xl text-center">
          <p className="eyebrow reveal text-bronze-light">{t(productions.title, locale)}</p>
          <h2 id="home-productions-title" className="words mt-8 font-display text-headline font-light text-balance">
            <Words text={t(productions.lead, locale)} />
          </h2>
        </header>

        <ul className="mt-16 grid gap-10 md:mt-24 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {productions.projects.map((project, i) => (
            <li key={i} className="reveal" style={delay(i * 140)}>
              <article className="group relative flex h-full flex-col">
                {project.image.src && (
                  <div className="hover-zoom relative aspect-[3/2] overflow-hidden bg-night-line/40">
                    <Image
                      src={project.image.src}
                      alt={t(project.image.alt, locale)}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className="object-cover object-[40%_50%]"
                    />
                  </div>
                )}
                <p className="eyebrow mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-night-soft">
                  <span>{t(project.format, locale)}</span>
                  <span className="flex items-center gap-2 text-bronze-light">
                    <span aria-hidden="true" className="pulse-dot" />
                    {t(project.status, locale)}
                  </span>
                </p>
                <h3 className="mt-4 font-display text-title font-light">
                  <Link href={href(locale, "/productions")} className="after:absolute after:inset-0">
                    {t(project.title, locale)}
                  </Link>
                </h3>
                <p className="mt-4 text-night-soft">{t(project.description, locale)}</p>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-16 text-center md:mt-20">
          <MoreLink to={href(locale, "/productions")} label={cta} tone="dark" />
        </div>
      </div>
    </section>
  );
}

/** Closing invitation to get in touch. */
export function ContactBand({ locale, heading, label }: { locale: Locale; heading: string; label: string }) {
  return (
    <section aria-labelledby="home-contact-title" className="relative isolate overflow-hidden bg-cream py-28 md:py-36">
      <Texture name="stone" className="-z-10 opacity-70" />
      <div className="shell mx-auto max-w-4xl text-center">
        <span aria-hidden="true" className="reveal-line-y mx-auto mb-10 block h-12 w-px bg-bronze" />
        <h2 id="home-contact-title" className="words font-display text-headline font-light">
          <Words text={heading} />
        </h2>
        <Link
          href={href(locale, "/contact")}
          className="btn-sweep arrow-link reveal eyebrow mt-12 inline-flex bg-charcoal px-8 py-5 text-ivory"
        >
          {label}
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
