import Image from "next/image";
import { Words } from "@/components/RichText";
import { Texture } from "@/components/Texture";
import type { SiteContent } from "@/lib/content-types";
import { t, type Locale } from "@/lib/i18n";

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

      <header className="shell text-center">
        <p className="eyebrow reveal text-bronze-light">{t(productions.title, locale)}</p>
        <h1
          id="productions-title"
          className="words mx-auto mt-8 max-w-5xl font-display text-display font-light text-balance"
        >
          <Words text={t(productions.lead, locale)} />
        </h1>
        <span
          aria-hidden="true"
          className="reveal-line-y mx-auto mt-14 block h-20 w-px bg-bronze-light/60"
          style={{ "--reveal-delay": "500ms" } as React.CSSProperties}
        />
      </header>

      {productions.projects.map((project, i) => {
        // The first project is set wide and cinematic; the rest alternate sides.
        const wide = i === 0;
        const imageFirst = i % 2 === 0;
        const title = t(project.title, locale);
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

        return wide ? (
          <article key={i} aria-labelledby={`project-${i}`} className="group mt-24 md:mt-36">
            <div className="shell">
              <figure className="reveal-image hover-zoom relative mx-auto aspect-[4/3] max-w-7xl overflow-hidden bg-night-line/40 sm:aspect-[2.43/1]">
                {image}
              </figure>
              <div className="grid-12 mx-auto mt-12 max-w-7xl gap-y-8 md:mt-16">
                <div className="reveal col-span-12 lg:col-span-5">
                  {meta}
                  <h2 id={`project-${i}`} className="words mt-6 font-display text-headline font-light">
                    <Words text={title} />
                  </h2>
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
          <article key={i} aria-labelledby={`project-${i}`} className="group mt-24 md:mt-36">
            <div className="shell grid-12 mx-auto max-w-7xl items-center gap-y-10">
              <div
                className={`reveal order-2 col-span-12 lg:col-span-4 ${imageFirst ? "lg:order-2 lg:col-start-9" : "lg:order-1"}`}
              >
                {meta}
                <h2 id={`project-${i}`} className="words mt-6 font-display text-headline font-light text-balance">
                  <Words text={title} />
                </h2>
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
      })}
    </section>
  );
}
