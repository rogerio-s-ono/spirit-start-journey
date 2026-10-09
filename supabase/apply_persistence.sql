-- ============================================================================
-- Consolidated persistence setup for Faith Journey (idempotent).
--
-- Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run) for the project that backs the deployed app.
--
-- It guarantees that every user-owned table has Row Level Security ENABLED
-- and the correct SELECT/INSERT/UPDATE/DELETE policies. Without these, the
-- client's writes (journal entries, completed lessons, quiz answers, reading
-- progress, achievements, profile) are rejected and nothing persists.
--
-- Safe to re-run: it drops and recreates each policy.
-- Assumes the tables already exist (created by the base migration).
-- ============================================================================

-- Make sure RLS is on everywhere it matters.
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles  (owner can read / insert / update their own row)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"   ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- journal_entries  (owner read / insert / delete)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own entries"   ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.journal_entries;
CREATE POLICY "Users can view their own entries"   ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- completed_lessons  (owner read / insert)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own completed lessons" ON public.completed_lessons;
DROP POLICY IF EXISTS "Users can complete lessons"                 ON public.completed_lessons;
CREATE POLICY "Users can view their own completed lessons" ON public.completed_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete lessons"                 ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- quiz_answers  (owner read / insert / update  -> upsert needs UPDATE)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can submit answers"         ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can update their answers"   ON public.quiz_answers;
CREATE POLICY "Users can view their own answers" ON public.quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit answers"         ON public.quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their answers"   ON public.quiz_answers FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_reading_progress  (owner read / insert / update)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_reading_progress;
DROP POLICY IF EXISTS "Users can start plans"             ON public.user_reading_progress;
DROP POLICY IF EXISTS "Users can update their progress"   ON public.user_reading_progress;
CREATE POLICY "Users can view their own progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can start plans"             ON public.user_reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress"   ON public.user_reading_progress FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_achievements  (owner read / insert)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock achievements"         ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements"         ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Backfill: create a profiles row for any existing user that doesn't have one
-- (the on_auth_user_created trigger only fires for NEW signups, so accounts
-- created before the trigger existed would have no profile row).
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (user_id, name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
