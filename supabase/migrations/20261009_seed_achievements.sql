-- Seed the achievements catalog so the achievement-unlock triggers can
-- insert into user_achievements without violating the foreign key
-- user_achievements_achievement_id_fkey (error 23503). Without these rows,
-- creating a journal entry or completing a lesson is rolled back.
--
-- Values mirror `badges` in src/data/lessons.ts. Idempotent via upsert.
INSERT INTO public.achievements (id, name, description, icon, condition) VALUES
  ('first-prayer',    'First Prayer',       'Wrote your first prayer',        '🙏', 'journal_prayer'),
  ('first-reflection','First Reflection',   'Completed your first reflection','✍️', 'journal_reflection'),
  ('first-lesson',    'First Lesson',       'Completed your first lesson',    '📘', 'lesson_1'),
  ('week-streak',     '7-Day Journey',      'Used the app for 7 days',        '🔥', 'streak_7'),
  ('level-1',         'Faithful Beginner',  'Completed Level 0',              '🌱', 'level_0_complete'),
  ('level-2',         'Growing in Faith',   'Completed Level 1',              '🌿', 'level_1_complete'),
  ('bible-reader',    'Bible Reader',       'Started a reading plan',         '📖', 'reading_plan'),
  ('five-lessons',    'Dedicated Learner',  'Completed 5 lessons',            '⭐', 'lesson_5')
ON CONFLICT (id) DO UPDATE
  SET name        = EXCLUDED.name,
      description = EXCLUDED.description,
      icon        = EXCLUDED.icon,
      condition   = EXCLUDED.condition;
