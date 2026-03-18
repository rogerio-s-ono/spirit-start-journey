import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { useLanguage } from "@/i18n/LanguageContext";
import { lessons } from "@/data/lessons";
import { ArrowLeft, Check } from "lucide-react";
import type { Quiz } from "@/data/lessons";

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, completeLesson, answerQuiz } = useProgress();
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return <div className="p-8 text-center text-muted-foreground">{t("lesson.notFound")}</div>;

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const isQuiz = lesson.type === "quiz";
  const quiz = isQuiz ? (lesson as Quiz) : null;

  const lessonTitle = t(`lesson.${lesson.id}.title` as any);
  const lessonDesc = t(`lesson.${lesson.id}.description` as any);
  const lessonReflection = t(`lesson.${lesson.id}.reflection` as any);

  const verseKeyMap: Record<string, string> = {
    "John 3:16": "verse.john3:16",
    "Mark 8:36": "verse.mark8:36",
    "St. Augustine": "verse.augustine",
    "Ephesians 2:8": "verse.eph2:8",
    "John 14:6": "verse.john14:6",
    "Romans 3:23": "verse.rom3:23",
    "John 3:3": "verse.john3:3",
    "James 4:8": "verse.james4:8",
    "Philippians 4:6": "verse.phil4:6",
    "Psalm 119:105": "verse.psalm119:105",
    "2 Timothy 3:16": "verse.2tim3:16",
    "Habakkuk 2:2": "verse.hab2:2",
    "Psalm 46:10": "verse.psalm46:10",
    "1 Corinthians 10:13": "verse.1cor10:13",
    "1 Corinthians 10:31": "verse.1cor10:31",
    "Joshua 24:15": "verse.josh24:15",
    "Matthew 18:20": "verse.matt18:20",
    "1 Peter 3:15": "verse.1pet3:15",
  };

  const handleComplete = () => {
    completeLesson(lesson.id, lesson.xp);
    if (isQuiz && selectedAnswer) {
      answerQuiz(lesson.id, selectedAnswer);
    }
  };

  const handleQuizSelect = (label: string) => {
    setSelectedAnswer(label);
    setShowResult(true);
  };

  return (
    <motion.div
      className="min-h-screen pb-24 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-micro">{isQuiz ? t("lesson.reflectionQuiz") : t("lesson.lesson")}</span>
            <p className="text-sm font-medium text-foreground truncate">{lessonTitle}</p>
          </div>
          {isCompleted && (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center glow-gold">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-4">{lessonTitle}</h1>

        {isQuiz && quiz ? (
          <div>
            <p className="text-base text-foreground/80 leading-relaxed mb-6">
              {t(`lesson.${lesson.id}.question` as any)}
            </p>
            <div className="space-y-3">
              {(["A", "B", "C"] as const).map((label) => {
                const optionText = t(`lesson.${lesson.id}.option${label}` as any);
                const optionDesc = t(`lesson.${lesson.id}.option${label}.desc` as any);
                return (
                  <button
                    key={label}
                    onClick={() => handleQuizSelect(label)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      selectedAnswer === label
                        ? "border-primary/50 bg-primary/10 shadow-divine"
                        : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        selectedAnswer === label
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {label}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{optionText}</p>
                        {showResult && selectedAnswer === label && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-sm text-muted-foreground mt-2 leading-relaxed"
                          >
                            {optionDesc}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base text-foreground/80 leading-relaxed mb-6">{lessonDesc}</p>

            {"bibleVerse" in lesson && lesson.bibleVerse && lesson.bibleRef && (
              <div className="card-divine bg-primary/5 border-primary/20 mb-6">
                <p className="text-lg font-display italic text-foreground/90 leading-relaxed">
                  "{t((verseKeyMap[lesson.bibleRef] || "") as any) || lesson.bibleVerse}"
                </p>
                <p className="text-sm text-primary mt-2 font-medium">— {lesson.bibleRef}</p>
              </div>
            )}

            {"videoUrl" in lesson && lesson.videoUrl && (
              <div className="mb-6">
                <span className="text-micro mb-3 block">{t("lesson.watchLearn")}</span>
                <div className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border/30">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lessonTitle}
                  />
                </div>
              </div>
            )}

            {"reflection" in lesson && (
              <div className="card-celestial border-primary/10 mb-6">
                <span className="text-micro text-primary">{t("lesson.reflection")}</span>
                <p className="text-base text-foreground/80 mt-2 leading-relaxed font-display italic">
                  {lessonReflection}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 mb-4">
          {isCompleted ? (
            <div className="w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-sm font-medium text-primary">✓ {t("lesson.completed")} · +{lesson.xp} XP</span>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isQuiz && !selectedAnswer}
              className="w-full p-4 rounded-2xl bg-primary text-primary-foreground font-medium text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed glow-gold"
            >
              {isQuiz ? t("lesson.submitAnswer") : t("lesson.finishStep")} · +{lesson.xp} XP
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LessonPage;
