
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  current_level INTEGER NOT NULL DEFAULT 0,
  xp_points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create lessons table
CREATE TABLE public.lessons (
  id TEXT NOT NULL PRIMARY KEY,
  level_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  bible_verse TEXT,
  bible_ref TEXT,
  reflection_question TEXT,
  xp INTEGER NOT NULL DEFAULT 25,
  type TEXT NOT NULL DEFAULT 'lesson' CHECK (type IN ('lesson', 'quiz'))
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are readable by everyone" ON public.lessons FOR SELECT USING (true);

-- Create quiz_options table
CREATE TABLE public.quiz_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  option_text TEXT NOT NULL,
  description TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('spiritual', 'balanced', 'worldly'))
);

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz options are readable by everyone" ON public.quiz_options FOR SELECT USING (true);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prayer', 'reflection', 'thought')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition TEXT NOT NULL
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are readable by everyone" ON public.achievements FOR SELECT USING (true);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  date_unlocked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create completed_lessons table
CREATE TABLE public.completed_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own completed lessons" ON public.completed_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete lessons" ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create quiz_answers table
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own answers" ON public.quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit answers" ON public.quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create bible_plans table
CREATE TABLE public.bible_plans (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  chapters INTEGER NOT NULL,
  icon TEXT NOT NULL
);

ALTER TABLE public.bible_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bible plans are readable by everyone" ON public.bible_plans FOR SELECT USING (true);

-- Create user_reading_progress table
CREATE TABLE public.user_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.bible_plans(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_id)
);

ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can start plans" ON public.user_reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON public.user_reading_progress FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
