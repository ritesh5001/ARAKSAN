"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, type Locale } from "@/lib/i18n";

/** `section` is the id of a section on the home page; absent for separate pages. */
export type NavItem = { href: string; label: string; section?: string };

type Props = {
  locale: Locale;
  items: NavItem[];
  labels: { menu: string; close: string; language: string; home: string };
};

const HEADER_LINE = 88;

export function SiteHeader({ locale, items, labels }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  const onHome = rest === "/";

  // Track which section sits under the header: highlights the menu item and
  // switches the header to its dark style over the Productions section. The
  // header tucks away while reading down and returns on any scroll up.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      headerRef.current?.style.setProperty("--progress", String(max > 0 ? Math.min(1, y / max) : 0));
      if (Math.abs(y - lastY.current) > 6) {
        setTucked(y > 640 && y > lastY.current);
        lastY.current = y;
      }
      setScrolled(y > 24);
      let current: HTMLElement | null = null;
      for (const section of document.querySelectorAll<HTMLElement>("[data-section]")) {
        if (section.getBoundingClientRect().top <= HEADER_LINE) current = section;
      }
      setActive(current?.id ?? null);
      setDark(current?.dataset.header === "dark");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  // Close the menu on navigation (render-phase reset, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (item: NavItem) =>
    item.section ? onHome && active === item.section : rest.startsWith(item.href.replace(/^\/(en|fr)/, ""));

  const languageSwitch = (className: string) => (
    <ul className={`flex items-center gap-2 ${className}`} aria-label={labels.language}>
      {locales.map((l, i) => (
        <li key={l} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          )}
          <Link
            href={`/${l}${rest === "/" ? "" : rest}`}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={`inline-flex min-h-11 min-w-8 items-center justify-center ${l === locale ? "font-semibold" : "opacity-60 transition-opacity hover:opacity-100"}`}
          >
            {l.toUpperCase()}
          </Link>
        </li>
      ))}
    </ul>
  );

  const tone = dark
    ? "theme-night bg-night/85 text-ivory border-night-line backdrop-blur-md"
    : scrolled || !onHome
      ? "bg-ivory/85 text-charcoal border-line backdrop-blur-md"
      : "bg-transparent text-charcoal border-transparent";

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,color,border-color,translate] duration-700 ease-[var(--ease-expo)] focus-within:translate-y-0 ${tucked && !open ? "-translate-y-full" : ""} ${tone}`}
      >
        <div className="shell flex h-20 items-center justify-between md:h-22">
          <Link
            href={`/${locale}`}
            className="wordmark text-[1.2rem] md:text-[1.35rem]"
            aria-label={`Araksan — ${labels.home}`}
          >
            Araksan
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-8">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item) ? (item.section ? "location" : "page") : undefined}
                    className="link-underline eyebrow pb-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <span aria-hidden="true" className={`h-4 w-px ${dark ? "bg-night-line" : "bg-line"}`} />
            {languageSwitch("eyebrow")}
          </nav>

          <button
            ref={menuButton}
            type="button"
            className="eyebrow flex min-h-11 items-center gap-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            {labels.menu}
            <span aria-hidden="true" className="flex w-6 flex-col gap-1.5">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-2/3 self-end bg-current" />
            </span>
          </button>
        </div>
        {onHome && (
          // Reading progress through the page.
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-px origin-left bg-bronze"
            style={{ transform: "scaleX(var(--progress, 0))" }}
          />
        )}
      </header>

      {/* Outside <header>: its backdrop blur would otherwise confine this fixed overlay. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        hidden={!open}
        className="theme-night fixed inset-0 z-50 h-svh overflow-y-auto bg-night text-ivory lg:hidden"
      >
        <div className="shell flex h-20 items-center justify-between">
          <span className="wordmark text-[1.2rem]">Araksan</span>
          <button
            ref={closeButton}
            type="button"
            className="eyebrow min-h-11 px-1"
            onClick={() => {
              setOpen(false);
              menuButton.current?.focus();
            }}
          >
            {labels.close}
          </button>
        </div>
        <nav aria-label="Main" className="shell pt-10 pb-16">
          <ul className="border-t border-night-line">
            {items.map((item, i) => (
              <li
                key={item.href}
                className="menu-item border-b border-night-line"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item) ? (item.section ? "location" : "page") : undefined}
                  className="flex items-baseline gap-5 py-5 font-display text-[2.4rem] leading-none"
                >
                  <span className="eyebrow text-bronze-light">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {languageSwitch("eyebrow mt-10 text-sm")}
        </nav>
      </div>
    </>
  );
}
