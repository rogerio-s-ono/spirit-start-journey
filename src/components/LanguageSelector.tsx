import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const flags: { code: Language; flag: string; label: string }[] = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "en", flag: "🇬🇧", label: "English" },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      {flags.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          title={label}
          className={`text-xl w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            language === code
              ? "bg-primary/10 ring-2 ring-primary/30 scale-110"
              : "opacity-50 hover:opacity-80 hover:bg-muted"
          }`}
        >
          {flag}
        </button>
      ))}
    </div>
  );
};
