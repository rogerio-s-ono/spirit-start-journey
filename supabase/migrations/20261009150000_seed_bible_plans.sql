-- AUTO-GENERATED from src/data/lessons.ts (readingPlans) by
-- scripts/gen_bible_plans_seed.mjs.
-- Seeds public.bible_plans. Required because user_reading_progress.plan_id
-- has a foreign key to bible_plans(id); without these rows, starting a
-- reading plan fails with 23503 (user_reading_progress_plan_id_fkey).
-- Idempotent via ON CONFLICT.
INSERT INTO public.bible_plans (id, name, description, chapters, icon)
VALUES
  ('john', 'Gospel of John', 'Discover who Jesus is through the eyes of His closest friend.', 21, '📖'),
  ('mark', 'Gospel of Mark', 'A fast-paced account of Jesus'' life and ministry.', 16, '📕'),
  ('psalms', 'Psalms', 'Songs and prayers that express every human emotion before God.', 150, '🎵'),
  ('proverbs', 'Proverbs', 'Practical wisdom for everyday life.', 31, '💡')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  chapters    = EXCLUDED.chapters,
  icon        = EXCLUDED.icon;
