-- Fix RLS Policies for proper INSERT/UPDATE permissions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can complete lessons" ON public.completed_lessons;
DROP POLICY IF EXISTS "Users can submit answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can start plans" ON public.user_reading_progress;
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their progress" ON public.user_reading_progress;

-- Journal entries
CREATE POLICY "Users can view their own entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Completed lessons
CREATE POLICY "Users can view their own completed lessons" ON public.completed_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete lessons" ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz answers
CREATE POLICY "Users can view their own answers" ON public.quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit answers" ON public.quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their answers" ON public.quiz_answers FOR UPDATE USING (auth.uid() = user_id);

-- User reading progress
CREATE POLICY "Users can view their own progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can start plans" ON public.user_reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON public.user_reading_progress FOR UPDATE USING (auth.uid() = user_id);

-- User achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
