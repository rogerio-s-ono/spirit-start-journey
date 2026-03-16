import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { levels, lessons } from "@/data/lessons";
import { useNavigate } from "react-router-dom";
import { Check, Lock, ChevronRight } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const LearningPath = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 0) return true;
    const prevLevelLessons = lessons.filter((l) => l.levelId === levelId - 1);
    return prevLevelLessons.every((l) => progress.completedLessons.includes(l.id));
  };

  return (
    <motion.div
      className="min-h-screen bg-background pb-24 px-5 pt-12 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={fadeInUp} className="text-2xl font-display font-semibold text-foreground tracking-tight mb-8">
        Your Journey
      </motion.h1>

      {levels.map((level) => {
        const unlocked = isLevelUnlocked(level.id);
        const levelLessons = lessons.filter((l) => l.levelId === level.id);
        const completedCount = levelLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
        const allComplete = completedCount === levelLessons.length;

        return (
          <motion.div key={level.id} variants={fadeInUp} className="mb-6">
            <div className={`card-ceramic ${!unlocked ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{level.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-micro">Level {level.id}</span>
                    {allComplete && <Check className="w-3.5 h-3.5 text-secondary" />}
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <h2 className="text-lg font-display font-semibold text-foreground">{level.title}</h2>
                </div>
                <span className="text-sm text-muted-foreground">{completedCount}/{levelLessons.length}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{level.description}</p>

              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / levelLessons.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {unlocked && (
                <div className="mt-4 space-y-2">
                  {levelLessons.map((lesson) => {
                    const completed = progress.completedLessons.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-all text-left active:scale-[1.02]"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? "bg-primary" : "bg-muted"}`}>
                          {completed ? (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">{lesson.order}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${completed ? "text-muted-foreground" : "text-foreground"}`}>
                            {lesson.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {lesson.type === "quiz" ? "Quiz" : "Lesson"} · {lesson.xp} XP
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default LearningPath;
