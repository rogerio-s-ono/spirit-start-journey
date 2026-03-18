import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface JourneyNodeProps {
  progress: number;
  level: number;
  title: string;
}

export const JourneyNode = ({ progress, level, title }: JourneyNodeProps) => {
  const { t } = useLanguage();

  return (
    <div className="card-divine p-6 flex items-center gap-5 border-primary/15">
      {/* Circular progress */}
      <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="transparent" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.3" />
          <motion.circle
            cx="40" cy="40" r="34"
            fill="transparent"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray="213.6"
            initial={{ strokeDashoffset: 213.6 }}
            animate={{ strokeDashoffset: 213.6 - (213.6 * progress) / 100 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px hsl(38 65% 55% / 0.4))" }}
          />
        </svg>
        <span className="text-lg font-display font-bold text-primary z-10">{Math.round(progress)}%</span>
      </div>

      {/* Level info */}
      <div className="flex-1 min-w-0">
        <span className="text-micro text-primary">{t("path.level")} {level}</span>
        <h2 className="text-xl font-display font-semibold text-foreground tracking-tight mt-0.5 truncate">{title}</h2>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ boxShadow: "0 0 8px hsl(38 65% 55% / 0.5)" }}
          />
        </div>
      </div>
    </div>
  );
};
