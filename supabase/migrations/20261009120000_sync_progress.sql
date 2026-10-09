-- Trigger to update profile XP when a lesson is completed
CREATE OR REPLACE FUNCTION public.sync_profile_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET xp_points = xp_points + COALESCE((
    SELECT xp FROM public.lessons WHERE id = NEW.lesson_id
  ), 0)
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_xp_on_lesson_complete ON public.completed_lessons;
CREATE TRIGGER sync_xp_on_lesson_complete
  AFTER INSERT ON public.completed_lessons
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_xp();

-- Trigger to auto-unlock achievements based on progress
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for first-lesson achievement
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = 'first-lesson'
  ) AND EXISTS (
    SELECT 1 FROM public.completed_lessons WHERE user_id = NEW.user_id LIMIT 1
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'first-lesson')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check for five-lessons achievement
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = 'five-lessons'
  ) AND (
    SELECT COUNT(*) FROM public.completed_lessons WHERE user_id = NEW.user_id
  ) >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'five-lessons')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_achievements_on_lesson_complete ON public.completed_lessons;
CREATE TRIGGER check_achievements_on_lesson_complete
  AFTER INSERT ON public.completed_lessons
  FOR EACH ROW EXECUTE FUNCTION public.check_achievements();

-- Trigger to auto-unlock first-prayer achievement
CREATE OR REPLACE FUNCTION public.check_prayer_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'prayer' AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = 'first-prayer'
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'first-prayer')
    ON CONFLICT DO NOTHING;
  END IF;

  IF NEW.type = 'reflection' AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = 'first-reflection'
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'first-reflection')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_prayer_achievement ON public.journal_entries;
CREATE TRIGGER check_prayer_achievement
  AFTER INSERT ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.check_prayer_achievement();

-- Trigger to auto-unlock bible-reader achievement
CREATE OR REPLACE FUNCTION public.check_bible_reader_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = 'bible-reader'
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, 'bible-reader')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_bible_reader_achievement ON public.user_reading_progress;
CREATE TRIGGER check_bible_reader_achievement
  AFTER INSERT ON public.user_reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.check_bible_reader_achievement();
