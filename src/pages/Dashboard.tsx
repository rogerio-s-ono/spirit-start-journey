import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { JourneyNode } from "@/components/JourneyNode";
import { levels, lessons, dailyVerses, dailyChallenges } from "@/data/lessons";
import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Star, ChevronRight } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const Dashboard = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const currentLevel = levels[progress.currentLevel] || levels[0];
  const levelLessons = lessons.filter((l) => l.levelId === progress.currentLevel);
  const completedInLevel = levelLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const levelProgress = levelLessons.length > 0 ? (completedInLevel / levelLessons.length) * 100 : 0;

  const todayIndex = new Date().getDay();
  const verse = dailyVerses[todayIndex % dailyVerses.length];
  const challenge = dailyChallenges[todayIndex % dailyChallenges.length];

  const greeting = progress.userName ? `Peace be with you, ${progress.userName}.` : "Peace be with you.";
  const nextLesson = levelLessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <motion.div
      className="min-h-screen bg-background pb-24 px-5 pt-12 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">{greeting}</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-sm text-accent-foreground">
            <Star className="w-4 h-4 text-accent" />
            <span className="font-medium">{progress.xp} XP</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-accent" />
            <span>{progress.streak} day{progress.streak !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="mb-8">
        <JourneyNode progress={levelProgress} level={currentLevel.id} title={currentLevel.title} />
      </motion.div>

      {nextLesson && (
        <motion.button
          variants={fadeInUp}
          onClick={() => navigate(`/lesson/${nextLesson.id}`)}
          className="w-full card-ceramic flex items-center justify-between mb-4 active:scale-[1.02] transition-transform"
        >
          <div className="text-left">
            <span className="text-micro">Next step</span>
            <p className="text-base font-medium text-foreground mt-1">{nextLesson.title}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.button>
      )}

      <motion.div variants={fadeInUp} className="card-ceramic mb-4 bg-primary/5 border-primary/20">
        <span className="text-micro text-primary">Daily Challenge</span>
        <p className="text-sm text-foreground mt-2 leading-relaxed">{challenge}</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="card-ceramic mb-4">
        <span className="text-micro">Verse of the Day</span>
        <p className="text-base font-display italic text-foreground mt-3 leading-relaxed">"{verse.verse}"</p>
        <p className="text-sm text-muted-foreground mt-2">— {verse.ref}</p>
      </motion.div>

      {progress.journalEntries.length > 0 && (
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-micro">Recent Journal</h3>
            <button onClick={() => navigate("/journal")} className="text-xs text-primary font-medium">View All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {progress.journalEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="card-ceramic min-w-[200px] flex-shrink-0 p-4">
                <span className="text-micro capitalize">{entry.type}</span>
                <p className="text-sm text-foreground mt-1 line-clamp-3">{entry.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/path")} className="card-ceramic p-4 text-left active:scale-[1.02] transition-transform">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <span className="text-sm font-medium text-foreground">Learning Path</span>
        </button>
        <button onClick={() => navigate("/journal")} className="card-ceramic p-4 text-left active:scale-[1.02] transition-transform">
          <BookOpen className="w-5 h-5 text-secondary mb-2" />
          <span className="text-sm font-medium text-foreground">Journal</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
