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
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
        <circle cx="96" cy="96" r="88" fill="transparent" stroke="hsl(var(--border))" strokeWidth="4" />
        <motion.circle
          cx="96" cy="96" r="88"
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeDasharray="553"
          initial={{ strokeDashoffset: 553 }}
          animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-micro">{t("path.level")} {level}</span>
        <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight mt-1">{title}</h2>
        <span className="text-sm text-muted-foreground font-body mt-1 block">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
