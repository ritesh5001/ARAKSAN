"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEALABLE = ".reveal, .words:not(.words-load), .reveal-image, .reveal-line, .reveal-line-y, .sheen";

/**
 * Adds `is-visible` to revealable elements as they scroll into view, and
 * drives gentle depth parallax on `[data-parallax]` layers (desktop only,
 * never with reduced motion).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(REVEALABLE);
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    elements.forEach((el) => {
      if (!el.classList.contains("is-visible")) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const layers = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
    if (!layers.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const enabled = wide.matches && !reduce.matches;
      const viewport = window.innerHeight;
      for (const layer of layers) {
        if (!enabled) {
          layer.style.transform = "";
          continue;
        }
        const box = layer.parentElement!.getBoundingClientRect();
        if (box.bottom < -200 || box.top > viewport + 200) continue;
        // Layers move slower than the page: offset against distance from centre.
        const offset = -(box.top + box.height / 2 - viewport / 2) * Number(layer.dataset.parallax || 0.1);
        layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduce.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduce.removeEventListener("change", schedule);
    };
  }, [pathname]);

  return null;
}
