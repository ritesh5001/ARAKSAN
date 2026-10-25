export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 12"
      className={`arrow h-3 w-8 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M0 6h31M26 1l5 5-5 5" />
    </svg>
  );
}
