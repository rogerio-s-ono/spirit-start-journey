import { useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/i18n/LanguageContext";
import { Plus, X } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const Journal = () => {
  const { progress, addJournalEntry } = useProgress();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState<"prayer" | "reflection" | "thought">("reflection");
  const [content, setContent] = useState("");

  const typeLabels: Record<string, string> = {
    prayer: `🙏 ${t("journal.prayer")}`,
    reflection: `✍️ ${t("journal.reflectionType")}`,
    thought: `💭 ${t("journal.thought")}`,
  };
  const typeColors: Record<string, string> = {
    prayer: "bg-primary/5 border-primary/10",
    reflection: "bg-accent/5 border-accent/10",
    thought: "bg-secondary/10 border-secondary/20",
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    addJournalEntry(entryType, content.trim());
    setContent("");
    setShowForm(false);
  };

  const placeholders: Record<string, string> = {
    prayer: t("journal.placeholderPrayer"),
    reflection: t("journal.placeholderReflection"),
    thought: t("journal.placeholderThought"),
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-5 pt-12 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">{t("journal.title")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground active:scale-[1.02] transition-transform"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-celestial mb-6"
        >
          <span className="text-micro mb-3 block">{t("journal.newEntry")}</span>
          <div className="flex gap-2 mb-4">
            {(["prayer", "reflection", "thought"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setEntryType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  entryType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {type === "prayer" ? t("journal.prayer") : type === "reflection" ? t("journal.reflectionType") : t("journal.thought")}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholders[entryType]}
            className="w-full h-32 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-body leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full mt-3 p-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all active:scale-[1.02] disabled:opacity-40"
          >
            {t("journal.saveEntry")}
          </button>
        </motion.div>
      )}

      {progress.journalEntries.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-muted-foreground text-sm">{t("journal.emptyTitle")}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("journal.emptySubtitle")}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {progress.journalEntries.map((entry) => (
            <motion.div key={entry.id} variants={fadeInUp} className={`card-ceramic ${typeColors[entry.type]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-micro">{typeLabels[entry.type]}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Journal;
