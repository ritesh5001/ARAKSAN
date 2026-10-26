import Image from "next/image";
import { Fragment } from "react";
import { ProductionsLogo } from "@/components/ProductionsLogo";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { t, type Locale } from "@/lib/i18n";
import { projectSlug } from "@/lib/projects";

export function Productions({ locale, productions }: { locale: Locale; productions: SiteContent["productions"] }) {
  return (
    <section
      id="productions"
      data-section
      data-header="dark"
      aria-labelledby="productions-title"
      className="theme-night relative isolate overflow-hidden bg-night pt-36 pb-28 text-ivory md:pt-48 md:pb-44"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[56rem] [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
      >
        <Texture name="night" />
      </div>

      {/* ARAG SAN Productions: the production identity for her creative work. */}
      <header className="shell text-center">
        <h1 id="productions-title" className="hero-in mx-auto w-full max-w-[22rem] sm:max-w-xl md:max-w-3xl">
          <ProductionsLogo priority />
        </h1>
        <p
          className="words mx-auto mt-14 max-w-4xl font-display text-headline font-light text-balance md:mt-20"
          style={{ "--words-delay": "300ms" } as React.CSSProperties}
        >
          <Words text={t(productions.lead, locale)} />
        </p>
        <span
          aria-hidden="true"
          className="reveal-line-y mx-auto mt-14 block h-16 w-px bg-bronze-light/60"
          style={{ "--reveal-delay": "500ms" } as React.CSSProperties}
        />
        {/* Index of the portfolio, linking to each project below. */}
        <nav aria-label={t(productions.title, locale)} className="reveal mx-auto mt-12 max-w-4xl">
          <ol className="grid border-y border-night-line sm:grid-cols-3">
            {productions.projects.map((project, i) => (
              <li
                key={i}
                className="border-night-line not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l"
              >
                <a
                  href={`#${projectSlug(project)}`}
                  className="group flex min-h-11 items-baseline justify-center gap-3 px-4 py-5 transition-colors hover:text-bronze-light"
                >
                  <span className="eyebrow text-bronze-light">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[1.3rem]">{t(project.title, locale)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {productions.projects.map((project, i) => {
        // The first project is set wide and cinematic; the rest alternate sides.
        const wide = i === 0;
        const imageFirst = i % 2 === 0;
        const title = t(project.title, locale);
        const Heading = project.series ? "h3" : "h2";
        const numiIntro = project.series === "numi" && productions.projects.findIndex((p) => p.series === "numi") === i;
        const question = t(project.question, locale);
        const meta = (
          <p className="eyebrow flex flex-wrap items-center gap-x-4 gap-y-2 text-night-soft">
            <span>{t(project.format, locale)}</span>
            <span className="flex items-center gap-2.5 border border-bronze-light/50 px-3 py-1 text-bronze-light">
              <span aria-hidden="true" className="pulse-dot" />
              {t(project.status, locale)}
            </span>
          </p>
        );
        const image = project.image.src && (
          <div data-parallax="0.04" className="absolute inset-0 lg:-inset-y-[6%]">
            <Image
              src={project.image.src}
              alt={t(project.image.alt, locale)}
              fill
              sizes={wide ? "(min-width: 1280px) 1280px, 100vw" : "(min-width: 1024px) 55vw, 100vw"}
              className="object-cover"
            />
          </div>
        );

        const entry = wide ? (
          <article
            key={i}
            id={projectSlug(project)}
            aria-labelledby={`project-${i}`}
            className="group mt-24 scroll-mt-28 md:mt-36"
          >
            <div className="shell">
              <figure className="reveal-image hover-zoom relative mx-auto aspect-[4/3] max-w-7xl overflow-hidden bg-night-line/40 sm:aspect-[2.43/1]">
                {image}
              </figure>
              <div className="grid-12 mx-auto mt-12 max-w-7xl gap-y-8 md:mt-16">
                <div className="reveal col-span-12 lg:col-span-5">
                  {meta}
                  <Heading id={`project-${i}`} className="words mt-6 font-display text-headline font-light">
                    <Words text={title} />
                  </Heading>
                </div>
                <div
                  className="reveal col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-12"
                  style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
                >
                  {question && <p className="mb-6 font-display text-standfirst italic">{question}</p>}
                  <p className="text-night-soft">{t(project.description, locale)}</p>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article
            key={i}
            id={projectSlug(project)}
            aria-labelledby={`project-${i}`}
            className="group mt-24 scroll-mt-28 md:mt-36"
          >
            <div className="shell grid-12 mx-auto max-w-7xl items-center gap-y-10">
              <div
                className={`reveal order-2 col-span-12 lg:col-span-4 ${imageFirst ? "lg:order-2 lg:col-start-9" : "lg:order-1"}`}
              >
                {meta}
                <Heading id={`project-${i}`} className="words mt-6 font-display text-headline font-light text-balance">
                  <Words text={title} />
                </Heading>
                {question && <p className="mt-8 font-display text-standfirst italic">{question}</p>}
                <p className="mt-6 text-night-soft">{t(project.description, locale)}</p>
              </div>
              <figure
                className={`reveal-image hover-zoom relative order-1 col-span-12 aspect-[3/2] overflow-hidden bg-night-line/40 lg:col-span-7 ${imageFirst ? "lg:order-1" : "lg:order-2 lg:col-start-6"}`}
              >
                {image}
              </figure>
            </div>
          </article>
        );

        return (
          <Fragment key={i}>
            {numiIntro && <NumiIntro locale={locale} numi={productions.numi} />}
            {entry}
          </Fragment>
        );
      })}
    </section>
  );
}

/** One shared introduction for Numi, above its book and animation entries. */
function NumiIntro({ locale, numi }: { locale: Locale; numi: SiteContent["productions"]["numi"] }) {
  return (
    <section aria-labelledby="numi-title" id="numi" className="shell mt-28 scroll-mt-28 md:mt-44">
      <div className="mx-auto max-w-3xl border-t border-night-line pt-16 text-center md:pt-20">
        <h2 id="numi-title" className="words font-display text-display font-light">
          <Words text={t(numi.title, locale)} />
        </h2>
        <p className="reveal mt-10 font-display text-standfirst text-ivory/90">{t(numi.intro, locale)}</p>
      </div>
    </section>
  );
}
