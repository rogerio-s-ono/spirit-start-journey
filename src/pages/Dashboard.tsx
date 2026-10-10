import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/i18n/LanguageContext";
import { JourneyNode } from "@/components/JourneyNode";
import { levels, lessons } from "@/data/lessons";
import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Star, ChevronRight, Sparkles } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import logoCross from "@/assets/logo-cross.png";

const Dashboard = () => {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const currentLevel = levels[progress.currentLevel] || levels[0];
  const levelLessons = lessons.filter((l) => l.levelId === progress.currentLevel);
  const completedInLevel = levelLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const levelProgress = levelLessons.length > 0 ? (completedInLevel / levelLessons.length) * 100 : 0;

  const todayIndex = new Date().getDay();
  const challenge = t(`challenge.${todayIndex % 7}` as any);
  const verse = t(`dailyVerse.${todayIndex % 7}.verse` as any);
  const verseRef = t(`dailyVerse.${todayIndex % 7}.ref` as any);

  const levelTitle = t(`level.${currentLevel.id}.title` as any);
  const greeting = progress.userName
    ? `${t("dashboard.greeting")}, ${progress.userName}`
    : `${t("dashboard.greeting")}`;

  const nextLesson = levelLessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <motion.div
      className="min-h-screen pb-24 max-w-lg mx-auto relative"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      {/* Header — slim: brand left, key metrics (streak + XP) right.
          Language and logout now live in the Profile tab. */}
      <motion.header variants={fadeInUp} className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/40 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoCross} alt="Elevation Path" className="w-7 h-7 object-contain" />
            <span className="font-display text-base font-semibold text-gold-gradient">Elevation</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak — the hero metric, highlighted */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary tabular-nums">{progress.streak}</span>
            </div>
            {/* XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-border/60">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80 tabular-nums">{progress.xp}</span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="px-5 pt-6">
        {/* Greeting */}
        <motion.div variants={fadeInUp} className="mb-6">
          <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            {progress.streak > 0 
              ? `🔥 ${progress.streak} ${progress.streak !== 1 ? t("dashboard.days") : t("dashboard.day")} · ${progress.xp} XP`
              : `${progress.xp} XP`
            }
          </p>
        </motion.div>

        {/* Journey progress */}
        <motion.div variants={fadeInUp} className="mb-6">
          <JourneyNode progress={levelProgress} level={currentLevel.id} title={levelTitle} />
        </motion.div>

        {/* Next lesson CTA */}
        {nextLesson && (
          <motion.button
            variants={fadeInUp}
            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
            className="w-full card-divine flex items-center justify-between mb-4 active:scale-[0.98] transition-all group border-primary/20"
          >
            <div className="text-left flex-1">
              <span className="text-micro text-primary">{t("dashboard.nextStep")}</span>
              <p className="text-base font-medium text-foreground mt-1">
                {t(`lesson.${nextLesson.id}.title` as any)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </motion.button>
        )}

        {/* Daily challenge */}
        <motion.div variants={fadeInUp} className="card-celestial mb-4 border-primary/15">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-micro text-primary">{t("dashboard.dailyChallenge")}</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{challenge}</p>
        </motion.div>

        {/* Verse of the day */}
        <motion.div variants={fadeInUp} className="card-celestial mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
          <span className="text-micro">{t("dashboard.verseOfDay")}</span>
          <p className="text-lg font-display italic text-foreground/90 mt-3 leading-relaxed">"{verse}"</p>
          <p className="text-sm text-primary/80 mt-2 font-medium">— {verseRef}</p>
        </motion.div>

        {/* Recent journal */}
        {progress.journalEntries.length > 0 && (
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-micro">{t("dashboard.recentJournal")}</h3>
              <button onClick={() => navigate("/journal")} className="text-xs text-primary font-medium hover:text-gold-light transition-colors">{t("dashboard.viewAll")}</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {progress.journalEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="card-celestial min-w-[200px] flex-shrink-0 p-4">
                  <span className="text-micro capitalize">
                    {entry.type === "prayer" ? t("journal.prayer") : entry.type === "reflection" ? t("journal.reflectionType") : t("journal.thought")}
                  </span>
                  <p className="text-sm text-foreground/80 mt-1 line-clamp-3">{entry.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div variants={fadeInUp} className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/path")} className="card-celestial p-4 text-left active:scale-[0.98] transition-all group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{t("dashboard.learningPath")}</span>
          </button>
          <button onClick={() => navigate("/journal")} className="card-celestial p-4 text-left active:scale-[0.98] transition-all group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{t("dashboard.journal")}</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
