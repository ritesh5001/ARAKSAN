import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Prose, Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { href, t, type Locale } from "@/lib/i18n";

export function About({ locale, about }: { locale: Locale; about: SiteContent["about"] }) {
  return (
    <>
      <section
        id="about"
        data-section
        aria-labelledby="about-title"
        className="relative isolate overflow-hidden bg-ivory pt-36 pb-24 md:pt-48 md:pb-36"
      >
        {/* Ink-wash horizon behind the opening line, fading into the page. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[38rem] [mask-image:linear-gradient(to_bottom,black_40%,transparent_78%)] md:h-[46rem]"
        >
          <Texture name="horizon" className="object-[50%_70%] opacity-80" />
        </div>

        <div className="shell">
          <p className="eyebrow reveal text-bronze-ink">{t(about.title, locale)}</p>
          <h1 id="about-title" className="words mt-8 max-w-5xl font-display text-headline font-light text-balance">
            <Words text={t(about.lead, locale)} />
          </h1>

          <div className="grid-12 mt-20 gap-y-16 md:mt-28">
            {about.portrait.src && (
              <figure className="col-span-12 sm:col-span-9 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
                <div className="reveal-image hover-zoom relative aspect-[4/5] overflow-hidden bg-cream shadow-[0_30px_60px_-30px_rgb(28_27_25/0.35)]">
                  <Image
                    src={about.portrait.src}
                    alt={t(about.portrait.alt, locale)}
                    fill
                    sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, (min-width: 640px) 75vw, 100vw"
                    className="object-cover object-[50%_35%]"
                  />
                </div>
              </figure>
            )}
            <Prose
              text={t(about.body, locale)}
              reveal
              className="col-span-12 max-w-[36rem] lg:col-span-6 lg:col-start-7 lg:pt-4"
            />
          </div>
        </div>
      </section>

      {/* The closing line of the story, set apart on bronze. */}
      <section
        aria-label={t(about.title, locale)}
        className="sheen relative isolate overflow-hidden bg-[#a8865a] py-28 text-night md:py-40"
      >
        <Texture name="bronze" className="-z-10" />
        <figure className="shell mx-auto max-w-5xl text-center">
          <span aria-hidden="true" className="reveal-line-y mx-auto mb-12 block h-12 w-px bg-night/40" />
          <blockquote className="words font-display text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] font-light text-balance">
            <Words text={t(about.closing, locale)} />
          </blockquote>
        </figure>
      </section>
    </>
  );
}

/** Short introduction on the home page, leading to the About page. */
export function AboutIntro({ locale, about, cta }: { locale: Locale; about: SiteContent["about"]; cta: string }) {
  return (
    <section aria-labelledby="about-intro-title" className="relative isolate overflow-hidden bg-ivory py-28 md:py-40">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-full [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      >
        <Texture name="horizon" className="object-[50%_70%] opacity-70" />
      </div>
      <div className="shell mx-auto max-w-5xl text-center">
        <p className="eyebrow reveal text-bronze-ink">{t(about.title, locale)}</p>
        <h2 id="about-intro-title" className="words mt-8 font-display text-headline font-light text-balance">
          <Words text={t(about.lead, locale)} />
        </h2>
        <Link href={href(locale, "/about")} className="arrow-link reveal eyebrow mt-14 inline-flex text-charcoal">
          <span className="link-underline pb-1">{cta}</span>
          <Arrow className="text-bronze-ink" />
        </Link>
      </div>
    </section>
  );
}
