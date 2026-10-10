import type { Language } from "@/i18n/translations";

/**
 * Crisp inline-SVG flags. Flag emoji (🇧🇷 etc.) don't render on Windows/Chrome
 * — they fall back to the letter codes — so we draw simplified, recognizable
 * flags as SVG instead. Rounded corners + subtle ring handled by the caller.
 */
export function FlagIcon({ code, className = "" }: { code: Language; className?: string }) {
  const common = {
    viewBox: "0 0 24 16",
    className,
    role: "img" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (code === "pt") {
    // Brazil
    return (
      <svg {...common} aria-label="Brasil">
        <rect width="24" height="16" fill="#009B3A" />
        <path d="M12 2 22 8 12 14 2 8Z" fill="#FEDF00" />
        <circle cx="12" cy="8" r="3.1" fill="#002776" />
        <path d="M9.1 7.2a6 6 0 0 1 5.9 1.1" stroke="#fff" strokeWidth="0.7" fill="none" />
      </svg>
    );
  }

  if (code === "es") {
    // Spain
    return (
      <svg {...common} aria-label="España">
        <rect width="24" height="16" fill="#C60B1E" />
        <rect y="4" width="24" height="8" fill="#FFC400" />
      </svg>
    );
  }

  // en — United Kingdom (Union Jack, simplified)
  return (
    <svg {...common} aria-label="English">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="5.4" />
      <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}
