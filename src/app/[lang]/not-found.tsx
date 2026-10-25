import Link from "next/link";
import { lang } from "next/root-params";
import { Arrow } from "@/components/Arrow";
import { getContent } from "@/lib/content";
import { defaultLocale, hasLocale, href, t } from "@/lib/i18n";

export default async function NotFound() {
  const param = await lang();
  const locale = param && hasLocale(param) ? param : defaultLocale;
  const { navigation } = await getContent();

  return (
    <section className="shell flex min-h-[70svh] flex-col justify-center pt-40 pb-28">
      <p className="eyebrow text-bronze-ink">404</p>
      <h1 className="mt-6 max-w-3xl font-display text-headline font-light">{t(navigation.notFoundTitle, locale)}</h1>
      <Link href={href(locale)} className="arrow-link eyebrow mt-12 self-start text-charcoal">
        {t(navigation.notFoundLink, locale)}
        <Arrow />
      </Link>
    </section>
  );
}
