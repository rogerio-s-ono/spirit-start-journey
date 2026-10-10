import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import { FlagIcon } from "./FlagIcon";
import { Check } from "lucide-react";

const languages: { code: Language; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

/**
 * Compact flag-only switch for the login screen (public, pre-auth), where a
 * full list doesn't fit. Inside the app, language lives in the Profile tab.
 */
export const LanguageSwitchCompact = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1.5">
      {languages.map(({ code, label }) => {
        const active = language === code;
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              active ? "ring-2 ring-primary/50 scale-110" : "opacity-60 hover:opacity-100"
            }`}
          >
            <FlagIcon code={code} className="w-5 h-[14px] rounded-[2px] ring-1 ring-black/5" />
          </button>
        );
      })}
    </div>
  );
};

/**
 * Language picker as a readable list (flag SVG + name). Designed to live in
 * the Profile tab, not the dashboard header.
 */
export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-2">
      {languages.map(({ code, label }) => {
        const active = language === code;
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              active
                ? "bg-primary/10 border-primary/40"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            <FlagIcon code={code} className="w-6 h-4 rounded-[2px] ring-1 ring-black/5 shrink-0" />
            <span className={`flex-1 text-left text-sm font-medium ${active ? "text-foreground" : "text-foreground/80"}`}>
              {label}
            </span>
            {active && <Check className="w-4 h-4 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};
