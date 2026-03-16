import { useState, useEffect, useCallback } from "react";

export interface JournalEntry {
  id: string;
  type: "prayer" | "reflection" | "thought";
  content: string;
  date: string;
}

export interface UserProgress {
  completedLessons: string[];
  xp: number;
  currentLevel: number;
  journalEntries: JournalEntry[];
  streak: number;
  lastVisit: string;
  quizAnswers: Record<string, string>;
  readingPlans: Record<string, number>;
  earnedBadges: string[];
  userName: string;
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  xp: 0,
  currentLevel: 0,
  journalEntries: [],
  streak: 0,
  lastVisit: "",
  quizAnswers: {},
  readingPlans: {},
  earnedBadges: [],
  userName: "",
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem("faithjourney-progress");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Update streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (parsed.lastVisit === today) return parsed;
      if (parsed.lastVisit === yesterday) {
        return { ...parsed, streak: parsed.streak + 1, lastVisit: today };
      }
      return { ...parsed, streak: 1, lastVisit: today };
    }
    return { ...defaultProgress, lastVisit: new Date().toDateString(), streak: 1 };
  });

  useEffect(() => {
    localStorage.setItem("faithjourney-progress", JSON.stringify(progress));
  }, [progress]);

  const completeLesson = useCallback((lessonId: string, xp: number) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const newCompleted = [...prev.completedLessons, lessonId];
      const newXp = prev.xp + xp;
      // Check for badge milestones
      const newBadges = [...prev.earnedBadges];
      if (newCompleted.length === 1 && !newBadges.includes("first-lesson")) newBadges.push("first-lesson");
      if (newCompleted.length >= 5 && !newBadges.includes("five-lessons")) newBadges.push("five-lessons");
      
      // Check level completion
      const level0Lessons = ["0-1", "0-2", "0-3", "0-4"];
      const level1Lessons = ["1-1", "1-2", "1-3", "1-4", "1-5"];
      if (level0Lessons.every(l => newCompleted.includes(l)) && !newBadges.includes("level-1")) newBadges.push("level-1");
      if (level1Lessons.every(l => newCompleted.includes(l)) && !newBadges.includes("level-2")) newBadges.push("level-2");

      return { ...prev, completedLessons: newCompleted, xp: newXp, earnedBadges: newBadges };
    });
  }, []);

  const addJournalEntry = useCallback((type: JournalEntry["type"], content: string) => {
    setProgress((prev) => {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        type,
        content,
        date: new Date().toISOString(),
      };
      const newBadges = [...prev.earnedBadges];
      if (type === "prayer" && !newBadges.includes("first-prayer")) newBadges.push("first-prayer");
      if (type === "reflection" && !newBadges.includes("first-reflection")) newBadges.push("first-reflection");
      return {
        ...prev,
        journalEntries: [entry, ...prev.journalEntries],
        earnedBadges: newBadges,
      };
    });
  }, []);

  const answerQuiz = useCallback((quizId: string, answer: string) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [quizId]: answer },
    }));
  }, []);

  const startReadingPlan = useCallback((planId: string) => {
    setProgress((prev) => {
      const newBadges = [...prev.earnedBadges];
      if (!newBadges.includes("bible-reader")) newBadges.push("bible-reader");
      return {
        ...prev,
        readingPlans: { ...prev.readingPlans, [planId]: prev.readingPlans[planId] || 0 },
        earnedBadges: newBadges,
      };
    });
  }, []);

  const advanceReadingPlan = useCallback((planId: string) => {
    setProgress((prev) => ({
      ...prev,
      readingPlans: { ...prev.readingPlans, [planId]: (prev.readingPlans[planId] || 0) + 1 },
    }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setProgress((prev) => ({ ...prev, userName: name }));
  }, []);

  return {
    progress,
    completeLesson,
    addJournalEntry,
    answerQuiz,
    startReadingPlan,
    advanceReadingPlan,
    setUserName,
  };
}
