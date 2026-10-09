import { useState, useEffect, useCallback, useRef, createContext, useContext, createElement, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { lessons, levels } from "@/data/lessons";

/**
 * Derive the user's current level from the lessons they've completed.
 *
 * The current level is the highest level that is "unlocked": level 0 is always
 * unlocked, and each subsequent level unlocks once every lesson of the previous
 * level is completed. This replaces the old `profiles.current_level` field,
 * which was never incremented anywhere and left the dashboard meter stuck on
 * (and regressing to) level 0 after every reload.
 */
export function deriveCurrentLevel(completedLessons: string[]): number {
  const completed = new Set(completedLessons);
  let current = 0;
  for (const level of levels) {
    const lessonsInLevel = lessons.filter((l) => l.levelId === level.id);
    if (
      lessonsInLevel.length > 0 &&
      lessonsInLevel.every((l) => completed.has(l.id))
    ) {
      // This whole level is done; the next one becomes the current level.
      current = Math.min(level.id + 1, levels.length - 1);
    }
  }
  return current;
}

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

function useProgressState() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncTimerRef = useRef<NodeJS.Timeout>();

  // Load progress from Supabase or localStorage.
  // Extracted into a ref-stable callback so it can also be called after a
  // write (e.g. completing a lesson) to re-hydrate state from the database,
  // which is the source of truth for XP and completed lessons.
  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
        if (user) {
          // Load from Supabase
          // maybeSingle() returns null (no error) when the profile row does
          // not exist yet. Using single() here made PostgREST respond 404
          // (PGRST116) on every reload for users without a profile row,
          // showing a "Failed to load resource: 404" in the console on each
          // re-hydration (e.g. the 2nd reading-plan action).
          let { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          // Self-heal: if this signed-in user has no profile row yet (e.g.
          // account created before the handle_new_user trigger existed),
          // create it so profile updates and future loads work.
          if (!profile) {
            const { data: created, error: createError } = await supabase
              .from("profiles")
              .insert({ user_id: user.id, name: user.user_metadata?.name ?? "" })
              .select("*")
              .maybeSingle();
            if (createError) {
              console.error("Error creating profile:", createError);
            } else {
              profile = created;
            }
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

          const loadedCompleted = completedLessons?.map(l => l.lesson_id) || [];
          setProgress({
            completedLessons: loadedCompleted,
            xp: profile?.xp_points || 0,
            // Derive from completed lessons so the dashboard meter reflects
            // real progress and never regresses on reload.
            currentLevel: deriveCurrentLevel(loadedCompleted),
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


        } else {
          // Load from localStorage (fallback for non-authenticated users)
          const stored = localStorage.getItem("faithjourney-progress");
          if (stored) {
            const parsed = JSON.parse(stored);
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            // Always re-derive the current level from completed lessons.
            const currentLevel = deriveCurrentLevel(parsed.completedLessons || []);
            if (parsed.lastVisit === today) {
              setProgress({ ...parsed, currentLevel });
            } else if (parsed.lastVisit === yesterday) {
              setProgress({ ...parsed, currentLevel, streak: parsed.streak + 1, lastVisit: today });
            } else {
              setProgress({ ...parsed, currentLevel, streak: 1, lastVisit: today });
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
  }, [user]);

  // Hydrate on mount and whenever the authenticated user changes.
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Sync progress to localStorage (fallback) and Supabase
  useEffect(() => {
    const syncProgress = async () => {
      if (loading) return;

      // Always save to localStorage as fallback
      localStorage.setItem("faithjourney-progress", JSON.stringify(progress));

      if (!user) return;

      setSyncing(true);
      try {
        // Update profile.
        // NOTE: xp_points is intentionally NOT written here. A database
        // trigger (sync_profile_xp) is the source of truth for XP: it adds
        // the lesson's XP on each insert into completed_lessons. If the
        // client also wrote xp_points it would race with the trigger and
        // overwrite the correct value, making progress appear to regress on
        // reload.
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
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

      return {
        ...prev,
        completedLessons: newCompleted,
        xp: newXp,
        earnedBadges: newBadges,
        // Keep the level in sync with completed lessons immediately so the
        // meter advances without waiting for the DB reload.
        currentLevel: deriveCurrentLevel(newCompleted),
      };
    });

    // Persist to Supabase if authenticated.
    // Use upsert with ignoreDuplicates so a repeated completion (the table
    // has a unique(user_id, lesson_id) constraint) does not throw. We await
    // the write and then re-hydrate from the database so local state matches
    // what was actually persisted — including the XP computed by the
    // sync_profile_xp trigger. This prevents the progress meter from
    // regressing when navigating back to the dashboard.
    if (user) {
      (async () => {
        const { error } = await supabase
          .from("completed_lessons")
          .upsert(
            { user_id: user.id, lesson_id: lessonId },
            { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
          );
        if (error) {
          console.error("Error recording completed lesson:", error);
          return;
        }
        await loadProgress();
      })();
    }
  }, [user, loadProgress]);

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

    // Persist to Supabase if authenticated, then re-hydrate from the DB so
    // the entry carries its real server id/created_at and survives reloads.
    if (user) {
      (async () => {
        const { error } = await supabase
          .from("journal_entries")
          .insert({ user_id: user.id, type, content });
        if (error) {
          console.error("Error saving journal entry:", error);
          return;
        }
        await loadProgress();
      })();
    }
  }, [user, loadProgress]);

  const answerQuiz = useCallback((quizId: string, answer: string) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [quizId]: answer },
    }));

    // Persist to Supabase if authenticated. quiz_answers has
    // unique(user_id, lesson_id); upsert on that key updates an existing
    // answer instead of failing.
    if (user) {
      (async () => {
        const { error } = await supabase
          .from("quiz_answers")
          .upsert(
            { user_id: user.id, lesson_id: quizId, selected_option: answer },
            { onConflict: "user_id,lesson_id" }
          );
        if (error) {
          console.error("Error saving quiz answer:", error);
          return;
        }
        await loadProgress();
      })();
    }
  }, [user, loadProgress]);

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

    // Persist to Supabase if authenticated. user_reading_progress has
    // unique(user_id, plan_id); upsert with ignoreDuplicates avoids an error
    // if the plan was already started.
    if (user) {
      (async () => {
        const { error } = await supabase
          .from("user_reading_progress")
          .upsert(
            { user_id: user.id, plan_id: planId, current_day: 0 },
            { onConflict: "user_id,plan_id", ignoreDuplicates: true }
          );
        if (error) {
          console.error("Error starting reading plan:", error);
          return;
        }
        await loadProgress();
      })();
    }
  }, [user, loadProgress]);

  const advanceReadingPlan = useCallback((planId: string) => {
    let nextDay = 1;
    setProgress((prev) => {
      nextDay = (prev.readingPlans[planId] || 0) + 1;
      return {
        ...prev,
        readingPlans: { ...prev.readingPlans, [planId]: nextDay },
      };
    });

    // Persist to Supabase if authenticated. nextDay is derived from the
    // updater's prev state (not a stale closure over progress), so repeated
    // advances count correctly.
    if (user) {
      (async () => {
        const { error } = await supabase
          .from("user_reading_progress")
          .update({ current_day: nextDay })
          .eq("user_id", user.id)
          .eq("plan_id", planId);
        if (error) {
          console.error("Error advancing reading plan:", error);
          return;
        }
        await loadProgress();
      })();
    }
  }, [user, loadProgress]);

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

type ProgressContextValue = ReturnType<typeof useProgressState>;

const ProgressContext = createContext<ProgressContextValue | null>(null);

/**
 * Provides a SINGLE shared progress state to the whole app.
 *
 * Previously every page called useProgress() independently, so each one held
 * its own copy of the state. Completing a lesson on LessonPage updated that
 * page's copy and wrote to the DB, but navigating to the Dashboard mounted a
 * fresh copy that reloaded from the DB — and because navigation happens before
 * the async write settles, it read stale data and the meter regressed. With a
 * provider, all pages read the same in-memory state, so progress is consistent
 * immediately regardless of DB timing.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const value = useProgressState();
  return createElement(ProgressContext.Provider, { value }, children);
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
