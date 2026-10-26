export const PRODUCTIONS_NAME = "ARAG SAN Productions";
const ALT = `${PRODUCTIONS_NAME} — Seeing the beauty`;

/**
 * The approved ARAG SAN Productions logo (built by `npm run brand:productions`).
 * Phones get the compact lockup, whose PRODUCTIONS line and tagline are larger
 * so they stay legible at small sizes.
 */
export function ProductionsLogo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <picture className={`block ${className}`}>
      <source media="(min-width: 768px)" srcSet="/brand/arag-san-productions.svg" width={1261} height={368} />
      <img
        src="/brand/arag-san-productions-compact.svg"
        alt={ALT}
        width={1261}
        height={443}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-auto w-full"
      />
    </picture>
  );
}
