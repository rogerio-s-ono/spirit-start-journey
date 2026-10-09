import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncTimerRef = useRef<NodeJS.Timeout>();

  // Load progress from Supabase or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        if (user) {
          // Load from Supabase
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error loading profile:", profileError);
          }

          const { data: entries, error: entriesError } = await supabase
            .from("journal_entries")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (entriesError) {
            console.error("Error loading journal entries:", entriesError);
          }

          const { data: completedLessons, error: lessonsError } = await supabase
            .from("completed_lessons")
            .select("lesson_id")
            .eq("user_id", user.id);

          if (lessonsError) {
            console.error("Error loading completed lessons:", lessonsError);
          }

          const { data: quizAnswers, error: quizError } = await supabase
            .from("quiz_answers")
            .select("lesson_id, selected_option")
            .eq("user_id", user.id);

          if (quizError) {
            console.error("Error loading quiz answers:", quizError);
          }

          const { data: readingProgress, error: readingError } = await supabase
            .from("user_reading_progress")
            .select("plan_id, current_day")
            .eq("user_id", user.id);

          if (readingError) {
            console.error("Error loading reading progress:", readingError);
          }

          const { data: achievements, error: achievementsError } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", user.id);

          if (achievementsError) {
            console.error("Error loading achievements:", achievementsError);
          }

          // Update streak
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          let streak = 1;
          if (profile?.last_visit === today) {
            streak = profile.streak;
          } else if (profile?.last_visit === yesterday) {
            streak = (profile?.streak || 0) + 1;
          }

          setProgress({
            completedLessons: completedLessons?.map(l => l.lesson_id) || [],
            xp: profile?.xp_points || 0,
            currentLevel: profile?.current_level || 0,
            journalEntries: (entries || []).map(e => ({
              id: e.id,
              type: e.type as "prayer" | "reflection" | "thought",
              content: e.content,
              date: e.created_at,
            })),
            streak,
            lastVisit: today,
            quizAnswers: quizAnswers?.reduce((acc, q) => ({ ...acc, [q.lesson_id]: q.selected_option }), {}) || {},
            readingPlans: readingProgress?.reduce((acc, r) => ({ ...acc, [r.plan_id]: r.current_day }), {}) || {},
            earnedBadges: achievements?.map(a => a.achievement_id) || [],
            userName: profile?.name || "",
          });

          // Subscribe to real-time updates on profile
          const profileSubscription = supabase
            .channel(`profile:${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "profiles",
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                setProgress((prev) => ({
                  ...prev,
                  xp: payload.new?.xp_points || prev.xp,
                  currentLevel: payload.new?.current_level || prev.currentLevel,
                  streak: payload.new?.streak || prev.streak,
                  userName: payload.new?.name || prev.userName,
                }));
              }
            )
            .subscribe();

          // Subscribe to real-time updates on completed lessons
          const lessonsSubscription = supabase
            .channel(`lessons:${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "completed_lessons",
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                setProgress((prev) => ({
                  ...prev,
                  completedLessons: [...prev.completedLessons, payload.new.lesson_id],
                }));
              }
            )
            .subscribe();

          return () => {
            profileSubscription.unsubscribe();
            lessonsSubscription.unsubscribe();
          };
        } else {
          // Load from localStorage (fallback for non-authenticated users)
          const stored = localStorage.getItem("faithjourney-progress");
          if (stored) {
            const parsed = JSON.parse(stored);
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (parsed.lastVisit === today) {
              setProgress(parsed);
            } else if (parsed.lastVisit === yesterday) {
              setProgress({ ...parsed, streak: parsed.streak + 1, lastVisit: today });
            } else {
              setProgress({ ...parsed, streak: 1, lastVisit: today });
            }
          } else {
            setProgress({ ...defaultProgress, lastVisit: new Date().toDateString(), streak: 1 });
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        setProgress({ ...defaultProgress, lastVisit: new Date().toDateString(), streak: 1 });
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Sync progress to localStorage (fallback) and Supabase
  useEffect(() => {
    const syncProgress = async () => {
      if (loading) return;

      // Always save to localStorage as fallback
      localStorage.setItem("faithjourney-progress", JSON.stringify(progress));

      if (!user) return;

      setSyncing(true);
      try {
        // Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            xp_points: progress.xp,
            current_level: progress.currentLevel,
            streak: progress.streak,
            last_visit: new Date(progress.lastVisit).toISOString().split("T")[0],
            name: progress.userName,
          })
          .eq("user_id", user.id);

        if (profileError) {
          console.error("Error syncing profile:", profileError);
        }
      } catch (error) {
        console.error("Error syncing progress:", error);
      } finally {
        setSyncing(false);
      }
    };

    // Clear previous timer
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // Debounce syncs
    syncTimerRef.current = setTimeout(syncProgress, 1000);
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [progress, user, loading]);

  const completeLesson = useCallback((lessonId: string, xp: number) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const newCompleted = [...prev.completedLessons, lessonId];
      const newXp = prev.xp + xp;
      const newBadges = [...prev.earnedBadges];
      if (newCompleted.length === 1 && !newBadges.includes("first-lesson")) newBadges.push("first-lesson");
      if (newCompleted.length >= 5 && !newBadges.includes("five-lessons")) newBadges.push("five-lessons");

      const level0Lessons = ["0-1", "0-2", "0-3", "0-4"];
      const level1Lessons = ["1-1", "1-2", "1-3", "1-4", "1-5"];
      if (level0Lessons.every(l => newCompleted.includes(l)) && !newBadges.includes("level-1")) newBadges.push("level-1");
      if (level1Lessons.every(l => newCompleted.includes(l)) && !newBadges.includes("level-2")) newBadges.push("level-2");

      return { ...prev, completedLessons: newCompleted, xp: newXp, earnedBadges: newBadges };
    });

    // Sync to Supabase if authenticated
    if (user) {
      supabase
        .from("completed_lessons")
        .insert({ user_id: user.id, lesson_id: lessonId })
        .catch(err => console.error("Error recording completed lesson:", err));
    }
  }, [user]);

  const addJournalEntry = useCallback((type: JournalEntry["type"], content: string) => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type,
      content,
      date: new Date().toISOString(),
    };

    setProgress((prev) => {
      const newBadges = [...prev.earnedBadges];
      if (type === "prayer" && !newBadges.includes("first-prayer")) newBadges.push("first-prayer");
      if (type === "reflection" && !newBadges.includes("first-reflection")) newBadges.push("first-reflection");
      return {
        ...prev,
        journalEntries: [entry, ...prev.journalEntries],
        earnedBadges: newBadges,
      };
    });

    // Sync to Supabase if authenticated
    if (user) {
      supabase
        .from("journal_entries")
        .insert({ user_id: user.id, type, content })
        .catch(err => console.error("Error saving journal entry:", err));
    }
  }, [user]);

  const answerQuiz = useCallback((quizId: string, answer: string) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [quizId]: answer },
    }));

    // Sync to Supabase if authenticated
    if (user) {
      supabase
        .from("quiz_answers")
        .upsert({ user_id: user.id, lesson_id: quizId, selected_option: answer })
        .catch(err => console.error("Error saving quiz answer:", err));
    }
  }, [user]);

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

    // Sync to Supabase if authenticated
    if (user) {
      supabase
        .from("user_reading_progress")
        .insert({ user_id: user.id, plan_id: planId, current_day: 0 })
        .catch(err => console.error("Error starting reading plan:", err));
    }
  }, [user]);

  const advanceReadingPlan = useCallback((planId: string) => {
    setProgress((prev) => ({
      ...prev,
      readingPlans: { ...prev.readingPlans, [planId]: (prev.readingPlans[planId] || 0) + 1 },
    }));

    // Sync to Supabase if authenticated
    if (user) {
      supabase
        .from("user_reading_progress")
        .update({ current_day: (progress.readingPlans[planId] || 0) + 1 })
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .catch(err => console.error("Error advancing reading plan:", err));
    }
  }, [user, progress.readingPlans]);

  const setUserName = useCallback((name: string) => {
    setProgress((prev) => ({ ...prev, userName: name }));
  }, []);

  return {
    progress,
    loading,
    syncing,
    completeLesson,
    addJournalEntry,
    answerQuiz,
    startReadingPlan,
    advanceReadingPlan,
    setUserName,
  };
}
