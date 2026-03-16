import { useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { badges, readingPlans } from "@/data/lessons";
import { Award, BookOpen, Flame, Star, User } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const Profile = () => {
  const { progress, setUserName, startReadingPlan, advanceReadingPlan } = useProgress();
  const [nameInput, setNameInput] = useState(progress.userName);
  const [editingName, setEditingName] = useState(!progress.userName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setEditingName(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background pb-24 px-5 pt-12 max-w-lg mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp} className="card-ceramic text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="w-7 h-7 text-primary" />
        </div>
        {editingName ? (
          <div className="flex gap-2 max-w-[240px] mx-auto">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button onClick={handleSaveName} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingName(true)} className="text-lg font-display font-semibold text-foreground">
            {progress.userName || "Set your name"}
          </button>
        )}

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-lg font-semibold text-foreground">{progress.xp}</span>
            </div>
            <span className="text-micro">XP</span>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-lg font-semibold text-foreground">{progress.streak}</span>
            </div>
            <span className="text-micro">Streak</span>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-lg font-semibold text-foreground">{progress.completedLessons.length}</span>
            </div>
            <span className="text-micro">Lessons</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-accent" />
          <h2 className="text-micro">Achievements</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const earned = progress.earnedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`card-ceramic p-4 ${earned ? "" : "opacity-40"}`}>
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <p className="text-sm font-medium text-foreground">{badge.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-micro">Bible Reading Plans</h2>
        </div>
        <div className="space-y-3">
          {readingPlans.map((plan) => {
            const chaptersRead = progress.readingPlans[plan.id] || 0;
            const started = plan.id in progress.readingPlans;
            const progressPercent = (chaptersRead / plan.chapters) * 100;

            return (
              <div key={plan.id} className="card-ceramic">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{plan.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{plan.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                    {started && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">{chaptersRead} / {plan.chapters} chapters</span>
                      </div>
                    )}
                  </div>
                  {!started ? (
                    <button onClick={() => startReadingPlan(plan.id)} className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Start
                    </button>
                  ) : chaptersRead < plan.chapters ? (
                    <button onClick={() => advanceReadingPlan(plan.id)} className="px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium">
                      +1
                    </button>
                  ) : (
                    <span className="text-xs text-secondary font-medium">Done ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
