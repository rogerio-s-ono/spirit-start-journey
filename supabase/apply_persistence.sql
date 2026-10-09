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

-- ---------------------------------------------------------------------------
-- Seed the achievements catalog.
--
-- REQUIRED: the achievement-unlock triggers (sync_progress migration) insert
-- rows into user_achievements, which has a foreign key to achievements(id).
-- If achievements is empty, inserting a journal entry / completing a lesson
-- fails with:
--   23503  Key (achievement_id)=(first-reflection) is not present in
--          table "achievements"  (user_achievements_achievement_id_fkey)
-- ...and the whole write (e.g. the journal entry) is rolled back.
--
-- Values mirror `badges` in src/data/lessons.ts. Idempotent via upsert.
-- ---------------------------------------------------------------------------
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

-- ===========================================================================
-- Seed the lessons catalog (mirror of 20261009140000_seed_lessons.sql).
-- Required: completed_lessons.lesson_id -> lessons(id) FK. Without these rows,
-- completing a lesson fails with 23503 and PROGRESS NEVER PERSISTS.
-- ===========================================================================
INSERT INTO public.lessons
  (id, level_id, sort_order, title, description, video_url, bible_verse, bible_ref, reflection_question, xp, type)
VALUES
  ('0-1', 0, 1, 'What Does It Mean to Be a Christian Today?', 'Christianity is not just a religion — it''s a relationship with God through Jesus Christ. In a world full of noise, being a Christian means choosing to follow Jesus and letting His love transform your life from the inside out.', 'https://www.youtube.com/embed/7hUKXnFnXe0', 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'John 3:16', 'What does being a Christian mean to you personally?', 25, 'lesson'),
  ('0-2', 0, 2, 'Material Success vs Spiritual Purpose', 'The world tells us that happiness comes from wealth, status, and achievement. But Jesus offers something deeper — a purpose that money can''t buy and circumstances can''t take away. True fulfillment comes from knowing why you were created.', NULL, 'What good is it for someone to gain the whole world, yet forfeit their soul?', 'Mark 8:36', 'Have you ever achieved something you wanted and still felt empty?', 25, 'lesson'),
  ('0-3', 0, 3, 'What People Truly Seek in Life', 'At the deepest level, every person is searching for love, meaning, and belonging. These longings point us toward something beyond ourselves — toward the God who created us to know Him.', NULL, 'You have made us for yourself, O Lord, and our hearts are restless until they rest in you.', 'St. Augustine', 'What are you truly searching for in life?', 25, 'lesson'),
  ('0-4', 0, 4, 'What Do You Really Want for Your Life?', 'Imagine you could have anything. Which path speaks most to your heart?', NULL, NULL, NULL, NULL, 25, 'quiz'),
  ('1-1', 1, 1, 'The Plan of Salvation', 'God''s plan of salvation is simple but profound: He loves us, we''ve all fallen short, Jesus paid the price, and we receive salvation by faith. It''s a gift — not something we earn, but something we receive with open hands.', 'https://www.youtube.com/embed/OwuElfMiKBs', 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.', 'Ephesians 2:8', 'How does it feel to know that salvation is a gift, not something you need to earn?', 40, 'lesson'),
  ('1-2', 1, 2, 'Who Jesus Is', 'Jesus is not just a historical figure or a good teacher — He is God in human form. He came to show us what God is like, to live a perfect life, and to give His life so we could be forgiven and made new.', NULL, 'Jesus answered, ''I am the way and the truth and the life. No one comes to the Father except through me.''', 'John 14:6', 'Before today, who did you think Jesus was?', 40, 'lesson'),
  ('1-3', 1, 3, 'What Sin Means', 'Sin isn''t just about breaking rules — it''s anything that separates us from God. It''s the gap between who we are and who God made us to be. The good news is that Jesus bridges that gap.', NULL, 'For all have sinned and fall short of the glory of God.', 'Romans 3:23', 'Is there anything in your life that you feel separates you from God?', 40, 'lesson'),
  ('1-4', 1, 4, 'What It Means to Be Born Again', 'Being born again means starting fresh — receiving a new spiritual life through Jesus. Just as you were physically born, God offers a spiritual rebirth that transforms your identity, purpose, and future.', NULL, 'Jesus replied, ''Very truly I tell you, no one can see the kingdom of God unless they are born again.''', 'John 3:3', 'What would it mean for you to start completely fresh?', 40, 'lesson'),
  ('1-5', 1, 5, 'Beginning a Relationship with God', 'A relationship with God begins with a simple conversation — prayer. You don''t need fancy words or perfect behavior. God meets you right where you are and invites you to walk with Him daily.', NULL, 'Come near to God and he will come near to you.', 'James 4:8', 'If you could say one thing to God right now, what would it be?', 40, 'lesson'),
  ('2-1', 2, 1, 'How to Pray', 'Prayer is simply talking to God. There''s no perfect formula — just honesty, gratitude, and trust. Start by telling God what''s on your heart, thanking Him for His blessings, and asking for His guidance.', NULL, 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', 'Philippians 4:6', 'What is one thing you''d like to talk to God about today?', 50, 'lesson'),
  ('2-2', 2, 2, 'How to Read the Bible', 'The Bible is God''s letter to you. Start with small portions — a few verses a day. Read slowly, think about what it means, and ask God to help you understand. The Gospel of John is a great place to begin.', NULL, 'Your word is a lamp for my feet, a light on my path.', 'Psalm 119:105', 'Have you ever read any part of the Bible? What stood out?', 50, 'lesson'),
  ('2-3', 2, 3, 'Understanding Scripture', 'Understanding the Bible takes time and patience. Consider the context, who wrote it, and who it was written for. Let the Holy Spirit guide your reading, and don''t be afraid to ask questions.', NULL, 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.', '2 Timothy 3:16', 'What question do you have about the Bible right now?', 50, 'lesson'),
  ('2-4', 2, 4, 'Creating a Spiritual Journal', 'A spiritual journal is a place to record your thoughts, prayers, and what God is teaching you. Writing helps you process your spiritual journey and notice patterns of growth and answered prayers.', NULL, 'Then the Lord replied: ''Write down the revelation and make it plain on tablets so that a herald may run with it.''', 'Habakkuk 2:2', 'What would you write in your first journal entry?', 50, 'lesson'),
  ('2-5', 2, 5, 'Listening to God', 'God speaks through His Word, through prayer, through other believers, and through the quiet voice of His Spirit. Learning to listen is one of the most beautiful parts of the Christian life.', NULL, 'Be still, and know that I am God.', 'Psalm 46:10', 'When was a time you felt a sense of peace or guidance that you couldn''t explain?', 50, 'lesson'),
  ('3-1', 3, 1, 'Facing Temptation', 'Temptation is part of life, but it doesn''t define you. Jesus Himself was tempted and overcame. Through His strength, prayer, and wisdom from Scripture, you can resist temptation and grow stronger.', NULL, 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.', '1 Corinthians 10:13', 'What temptation do you find most challenging?', 60, 'lesson'),
  ('3-2', 3, 2, 'Faith in Everyday Life', 'Faith isn''t just for Sundays — it''s for Monday mornings, difficult conversations, and ordinary moments. When you bring God into every part of your day, everything becomes an opportunity to grow.', NULL, 'So whether you eat or drink or whatever you do, do it all for the glory of God.', '1 Corinthians 10:31', 'How can you include God in one ordinary moment today?', 60, 'lesson'),
  ('3-3', 3, 3, 'Family and Faith', 'Faith begins at home. Whether your family shares your beliefs or not, you can be a light through love, patience, and example. God calls us to build homes grounded in His love.', NULL, 'But as for me and my household, we will serve the Lord.', 'Joshua 24:15', 'How does your faith affect your family relationships?', 60, 'lesson'),
  ('3-4', 3, 4, 'Christian Community', 'You were never meant to walk this journey alone. Christian community — whether a small group, a church, or a few friends — provides encouragement, accountability, and a place to belong.', NULL, 'For where two or three gather in my name, there am I with them.', 'Matthew 18:20', 'Do you have people in your life who encourage your faith?', 60, 'lesson'),
  ('3-5', 3, 5, 'Sharing Your Faith', 'Sharing your faith doesn''t mean having all the answers — it means sharing what God has done in your life. Your story is powerful, and someone needs to hear it.', NULL, 'Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.', '1 Peter 3:15', 'If someone asked you why you believe, what would you say?', 60, 'lesson')
ON CONFLICT (id) DO UPDATE SET
  level_id            = EXCLUDED.level_id,
  sort_order          = EXCLUDED.sort_order,
  title               = EXCLUDED.title,
  description         = EXCLUDED.description,
  video_url           = EXCLUDED.video_url,
  bible_verse         = EXCLUDED.bible_verse,
  bible_ref           = EXCLUDED.bible_ref,
  reflection_question = EXCLUDED.reflection_question,
  xp                  = EXCLUDED.xp,
  type                = EXCLUDED.type;

-- ===========================================================================
-- Seed bible_plans (mirror of 20261009150000_seed_bible_plans.sql).
-- Required: user_reading_progress.plan_id -> bible_plans(id) FK.
-- ===========================================================================
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
