import Link from "next/link";
import { cacheLife } from "next/cache";
import type { NavItem } from "./SiteHeader";

type Props = {
  home: string;
  items: NavItem[];
  privacy: NavItem;
  email: string | null;
  rights: string;
};

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ home, items, privacy, email, rights }: Props) {
  const year = await currentYear();

  return (
    <footer data-section data-header="dark" className="theme-night bg-night text-ivory">
      <div className="shell pt-20 pb-10 md:pt-28">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <Link href={home} className="wordmark -my-2 inline-block py-2 text-[1.6rem] md:text-[2rem]">
              Araksan
            </Link>
            <span aria-hidden="true" className="mt-6 block h-px w-16 bg-bronze" />
            {email && (
              <a
                href={`mailto:${email}`}
                className="link-underline mt-6 inline-block py-3 text-night-soft hover:text-ivory"
              >
                {email}
              </a>
            )}
          </div>
          <nav aria-label="Footer" className="col-span-12 md:col-span-6 md:col-start-7">
            <ul className="grid grid-cols-2 gap-x-8">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="eyebrow inline-flex min-h-11 items-center text-night-soft hover:text-ivory"
                  >
                    <span className="link-underline pb-1">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-20 flex flex-col gap-4 border-t border-night-line pt-8 text-sm text-night-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Araksan Idriss Omar. {rights}
          </p>
          <Link href={privacy.href} className="link-underline -my-3 self-start py-3 hover:text-ivory sm:self-auto">
            {privacy.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
