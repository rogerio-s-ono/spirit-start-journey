import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { lessons } from "@/data/lessons";
import { ArrowLeft, Check, Play } from "lucide-react";
import type { Quiz } from "@/data/lessons";

const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, completeLesson, answerQuiz } = useProgress();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return <div className="p-8 text-center text-muted-foreground">Lesson not found</div>;

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const isQuiz = lesson.type === "quiz";
  const quiz = isQuiz ? (lesson as Quiz) : null;

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
      className="min-h-screen bg-background pb-24 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-micro">{isQuiz ? "Reflection Quiz" : "Lesson"}</span>
            <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
          </div>
          {isCompleted && (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-4">{lesson.title}</h1>

        {isQuiz && quiz ? (
          /* Quiz Content */
          <div>
            <p className="text-base text-foreground leading-relaxed mb-6">{quiz.question}</p>
            <div className="space-y-3">
              {quiz.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleQuizSelect(option.label)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[1.02] ${
                    selectedAnswer === option.label
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-card shadow-soft hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                      selectedAnswer === option.label
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {option.label}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{option.text}</p>
                      {showResult && selectedAnswer === option.label && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-muted-foreground mt-2 leading-relaxed"
                        >
                          {option.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Lesson Content */
          <div>
            <p className="text-base text-foreground leading-relaxed mb-6">
              {"description" in lesson ? lesson.description : ""}
            </p>

            {/* Bible Verse */}
            {"bibleVerse" in lesson && (
              <div className="card-ceramic bg-primary/5 border-primary/10 mb-6">
                <p className="text-base font-display italic text-foreground leading-relaxed">
                  "{lesson.bibleVerse}"
                </p>
                <p className="text-sm text-primary mt-2 font-medium">— {lesson.bibleRef}</p>
              </div>
            )}

            {/* Video */}
            {"videoUrl" in lesson && lesson.videoUrl && (
              <div className="mb-6">
                <span className="text-micro mb-3 block">Watch & Learn</span>
                <div className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              </div>
            )}

            {/* Reflection */}
            {"reflection" in lesson && (
              <div className="card-ceramic bg-accent/10 border-accent/20 mb-6">
                <span className="text-micro text-accent-foreground">Reflection</span>
                <p className="text-base text-foreground mt-2 leading-relaxed font-display italic">
                  {lesson.reflection}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Complete Button */}
        <div className="mt-8 mb-4">
          {isCompleted ? (
            <div className="w-full p-4 rounded-2xl bg-muted text-center">
              <span className="text-sm font-medium text-muted-foreground">✓ Completed · +{lesson.xp} XP</span>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isQuiz && !selectedAnswer}
              className="w-full p-4 rounded-2xl bg-primary text-primary-foreground font-medium text-base transition-all active:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isQuiz ? "Submit Answer" : "Finish Step"} · +{lesson.xp} XP
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LessonPage;
