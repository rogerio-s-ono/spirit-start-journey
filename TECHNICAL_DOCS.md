# Spirit Start — Technical & Design Documentation

> Gamified spiritual journey app for new Christians and people curious about faith.
> Mobile-first web app with 3 languages, authentication, and cloud backend.

---

## 1. Product Overview

**Name:** Spirit Start (internal code name: Faith Journey)
**Audience:** People curious about Christianity, recent converts, users with little biblical knowledge who want guided spiritual growth.
**Concept:** A gamified learning path where users progress through levels by completing lessons, reflections, quizzes, and spiritual challenges. Progress earns XP, badges, and streaks.

### Learning Path

| Level | Name | Content | XP/lesson |
|-------|------|---------|-----------|
| 0 | Introduction | 3 lessons + 1 reflection quiz | 25 |
| 1 | First Steps in Faith | 5 lessons | 40 |
| 2 | Spiritual Habits | 5 lessons | 50 |
| 3 | Living the Christian Life | 5 lessons | 60 |

Level N unlocks only when **all** lessons of level N−1 are completed.

### Core Features
- **Dashboard** — current level, animated progress ring, daily challenge, verse of the day, next-lesson CTA, recent journal entries
- **Learning Path** — level cards with progress bars and locked/unlocked states
- **Lesson page** — explanation, Bible verse, optional embedded YouTube video, reflection question, completion button
- **Quiz** — 3 options per question, each reflecting a life priority (spiritual / balanced / worldly); no wrong answers, each selection shows a contextual description
- **Spiritual Journal** — entries typed as `prayer`, `reflection`, or `thought`
- **Bible Reading Plans** — John (21 ch), Mark (16 ch), Psalms (150 ch), Proverbs (31 ch); per-chapter progress tracking
- **Gamification** — XP, levels, 8 badges, daily streaks (streak increments on consecutive-day visits)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 + Vite 5 |
| Styling | Tailwind CSS v3 + custom CSS design tokens |
| UI components | shadcn/ui (Radix primitives) |
| Animation | Framer Motion 12 |
| Routing | react-router-dom v6 |
| Icons | lucide-react |
| Backend / Auth / DB | Lovable Cloud (Supabase) |
| Google OAuth | `@lovable.dev/cloud-auth-js` |
| Server state | @tanstack/react-query (installed; pages currently use local state) |
| Tests | Vitest + Testing Library + Playwright (available, minimal coverage) |

### Scripts
```bash
npm run dev        # dev server (port 8080)
npm run build      # production build
npm run test       # vitest
npm run lint       # eslint
```

---

## 3. Project Structure

```
src/
├── App.tsx                      # Router, providers, route guards
├── main.tsx                     # Entry point
├── index.css                    # Design tokens (CSS custom properties) + utility classes
├── assets/
│   ├── heaven-bg.jpg            # Celestial background (Welcome page)
│   └── logo-cross.png           # Golden cross logo (transparent PNG)
├── components/
│   ├── BottomNav.tsx            # Fixed bottom navigation (4 tabs)
│   ├── JourneyNode.tsx          # Animated circular level-progress card
│   ├── LanguageSelector.tsx     # PT/ES/EN flag pill selector
│   ├── NavLink.tsx
│   └── ui/                      # shadcn/ui component library
├── data/
│   └── lessons.ts               # Static content: levels, lessons, quiz, verses,
│                                #   challenges, reading plans, badges
├── hooks/
│   ├── useAuth.ts               # Supabase session state + signOut
│   ├── useProgress.ts           # User progress state (localStorage-persisted)
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── i18n/
│   ├── LanguageContext.tsx      # LanguageProvider + useLanguage() hook
│   └── translations.ts          # All UI strings in pt/es/en (~40 KB)
├── integrations/
│   ├── supabase/                # Auto-generated client + DB types (DO NOT EDIT)
│   └── lovable/                 # Auto-generated OAuth helper (DO NOT EDIT)
├── lib/
│   ├── animations.ts            # Shared Framer Motion variants
│   └── utils.ts                 # cn() class merger
└── pages/
    ├── Welcome.tsx              # Landing + login/signup (Google + email)
    ├── Dashboard.tsx            # Home
    ├── LearningPath.tsx         # Level/lesson map
    ├── LessonPage.tsx           # Lesson & quiz detail
    ├── Journal.tsx              # Spiritual journal CRUD (create/read)
    ├── Profile.tsx              # Stats, badges, reading plans, name
    └── NotFound.tsx
```

---

## 4. Routing & Auth Flow

| Route | Guard | Page |
|-------|-------|------|
| `/welcome` | redirects to `/` if logged in | Welcome |
| `/` | protected | Dashboard |
| `/path` | protected | LearningPath |
| `/lesson/:id` | protected | LessonPage |
| `/journal` | protected | Journal |
| `/profile` | protected | Profile |

- `useAuth()` subscribes to `supabase.auth.onAuthStateChange` and exposes `{ user, session, loading, signOut }`.
- `ProtectedRoute` shows a loading state until the session resolves, then redirects anonymous users to `/welcome`.
- `BottomNav` renders only when a user is authenticated.
- **Google sign-in:** `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` — redirect must be same-origin; never point it at a protected route.
- **Email/password:** `supabase.auth.signInWithPassword` / `signUp` (email confirmation enabled; `emailRedirectTo: window.location.origin`).
- On signup, a DB trigger (`handle_new_user`) auto-creates a row in `profiles`.

---

## 5. State Management

### `useProgress()` — user progress (currently localStorage)

Key: `faithjourney-progress`. Shape:

```ts
interface UserProgress {
  completedLessons: string[];            // lesson ids, e.g. "0-1"
  xp: number;
  currentLevel: number;
  journalEntries: JournalEntry[];        // { id, type, content, date }
  streak: number;                        // consecutive-day visits
  lastVisit: string;                     // Date.toDateString()
  quizAnswers: Record<string, string>;   // lessonId -> "A" | "B" | "C"
  readingPlans: Record<string, number>;  // planId -> chapters read
  earnedBadges: string[];                // badge ids
  userName: string;
}
```

Actions: `completeLesson(id, xp)`, `addJournalEntry(type, content)`, `answerQuiz`, `startReadingPlan`, `advanceReadingPlan`, `setUserName`.

**Badge logic lives inside the actions** (first lesson, 5 lessons, level completion, first prayer/reflection, reading-plan start). Streak logic runs in the state initializer: same day → keep; yesterday → +1; otherwise → reset to 1.

> ⚠️ **Known gap:** progress is stored in localStorage, not yet synced to the cloud tables (`completed_lessons`, `journal_entries`, `user_achievements`, `user_reading_progress`, `quiz_answers`). The schema exists and is ready — the sync layer is the main pending backend task.

### `useLanguage()` — i18n

- Languages: `pt` (default), `es`, `en`. Persisted in `faithjourney-language`.
- `t(key)` looks up `translations[key][language]`, falling back to English, then the raw key.
- Translation keys cover: navigation, dashboard, path, lessons (title/description/reflection per lesson id, e.g. `lesson.0-1.title`), quiz options (`lesson.0-4.optionA` / `.optionA.desc`), all Bible verses (`verse.john3:16` etc.), 7 daily verses, 7 daily challenges, badges, reading plans, auth strings.
- Bible verse lookup in `LessonPage` maps `bibleRef` → translation key via a `verseKeyMap` record.

### Static content — `src/data/lessons.ts`

`levels` (4), `lessons` (19, typed `Lesson | Quiz`), `dailyVerses` (7), `dailyChallenges` (7), `readingPlans` (4), `badges` (8). Lesson ids follow the pattern `{level}-{order}` (`"0-1"` … `"3-5"`). The same content is seeded into the cloud DB; the frontend currently reads from this file.

---

## 6. Database Schema (Lovable Cloud)

All tables in `public`, RLS enabled on every table.

| Table | Key columns | Access |
|-------|-------------|--------|
| `profiles` | `user_id` (→ auth.users, unique), `name`, `current_level`, `xp_points`, `streak`, `last_visit` | owner read/insert/update |
| `lessons` | `id` (text PK), `level_id`, `sort_order`, `title`, `description`, `video_url`, `bible_verse`, `bible_ref`, `reflection_question`, `xp`, `type` ('lesson'\|'quiz') | public read |
| `quiz_options` | `lesson_id` FK, `label`, `option_text`, `description`, `option_type` ('spiritual'\|'balanced'\|'worldly') | public read |
| `journal_entries` | `user_id`, `type` ('prayer'\|'reflection'\|'thought'), `content` | owner CRUD |
| `achievements` | `id` (text PK), `name`, `description`, `icon`, `condition` | public read |
| `user_achievements` | `user_id`, `achievement_id` FK, unique(user_id, achievement_id) | owner read/insert |
| `completed_lessons` | `user_id`, `lesson_id` FK, unique(user_id, lesson_id) | owner read/insert |
| `quiz_answers` | `user_id`, `lesson_id` FK, `selected_option`, unique(user_id, lesson_id) | owner read/insert |
| `bible_plans` | `id` (text PK), `name`, `description`, `chapters`, `icon` | public read |
| `user_reading_progress` | `user_id`, `plan_id` FK, `current_day`, unique(user_id, plan_id) | owner read/insert/update |

**Triggers:**
- `on_auth_user_created` → `handle_new_user()` inserts a `profiles` row (name from `raw_user_meta_data->>'name'`).
- `update_profiles_updated_at` → maintains `profiles.updated_at`.

**Seeded data:** all 19 lessons, 3 quiz options for lesson `0-4`, 8 achievements, 4 bible plans.

Types are auto-generated in `src/integrations/supabase/types.ts` — regenerate after schema changes, never hand-edit.

---

## 7. Design System

### Visual direction
**"Knocking on heaven's door"** — a premium, dark celestial aesthetic. Deep indigo night sky, radiant divine gold, glassmorphism, soft glows. Serif display type for a sacred, editorial feel. All values are semantic tokens in `src/index.css` — **never hardcode colors** in components.

### Color tokens (HSL custom properties)

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `225 25% 8%` | Deep indigo night |
| `--foreground` | `40 30% 95%` | Warm off-white text |
| `--card` | `225 20% 12%` | Card surface |
| `--primary` | `38 65% 55%` | Divine gold (CTAs, progress, accents) |
| `--primary-foreground` | `225 25% 8%` | Dark text on gold |
| `--secondary` | `225 15% 20%` | Muted indigo surface |
| `--muted` / `--muted-foreground` | `225 15% 16%` / `225 10% 55%` | Subtle surfaces / secondary text |
| `--accent` | `38 50% 45%` | Deeper gold |
| `--border` | `225 15% 18%` | Hairline borders |
| `--gold`, `--gold-light` | `38 65% 55%` / `40 70% 70%` | Gold scale |
| `--celestial`, `--celestial-deep` | `225 30% 25%` / `225 35% 12%` | Indigo depths |

### Gradients & shadows
- `--gradient-heaven` — page background (fixed, vertical indigo fade)
- `--gradient-divine` — gold diagonal
- `--gradient-glow` — radial gold ambient glow
- `--shadow-divine` / `--shadow-celestial` / `--shadow-lifted`

### Utility classes (defined in index.css)
- `.card-celestial` — frosted card: `bg-card/80 backdrop-blur-md rounded-2xl border shadow-celestial`
- `.card-divine` — gold-tinted frosted card with subtle gradient
- `.text-gold-gradient` — gold gradient text (logo/headings)
- `.glow-gold` — golden outer glow (primary buttons, completed states)
- `.divine-line` — horizontal fade-through-gold divider
- `.text-micro` — 11px uppercase tracking label

### Typography
- **Display:** Cormorant Garamond (serif) — headings, verses, reflection quotes (italic)
- **Body:** Inter — UI text
- Loaded via Google Fonts import in `index.css`.

### Motion
Shared variants in `src/lib/animations.ts`: `staggerContainer` (0.08s stagger), `fadeInUp` (spring, y:10→0), `staggerFast` (0.05s). Every page uses `initial="hidden" animate="show"` with staggered children. Custom keyframes in Tailwind config: `pulse-glow`, `float` (logo levitation on Welcome).

### Layout & components
- Mobile-first, `max-w-lg mx-auto` content column, `pb-24` clearance for the fixed bottom nav.
- **Header (Dashboard):** sticky, `backdrop-blur-xl bg-background/60`, logo + wordmark left, XP/streak pills + language selector right.
- **BottomNav:** fixed, `bg-background/80 backdrop-blur-xl`, 4 tabs (Home/Path/Journal/Profile), active tab in gold with dot indicator.
- **JourneyNode:** circular SVG progress ring (gold, glowing stroke) + linear bar, level title and percentage.
- **Buttons:** primary = gold bg + `.glow-gold`; `active:scale-[0.98]` press feedback everywhere.
- **Assets:** `src/assets/logo-cross.png` (radiant golden cross, transparent), `src/assets/heaven-bg.jpg` (clouds + divine light, Welcome backdrop with gradient overlay).

### Iconography
lucide-react only: `Home`, `Map`, `BookOpen`, `User`, `Star`, `Flame`, `Sparkles`, `ChevronRight`, `Check`, `Lock`, `ArrowLeft`, `Plus`, `X`, `Mail`, `Eye`, `EyeOff`, `Award`. Level/badge/plan icons are emoji (🌱🌿🌳🌻, 🙏✍️📘🔥, 📖📕🎵💡).

---

## 8. Internationalization

- Default language: **Portuguese (pt)**. Selector shows 🇧🇷 🇪🇸 🇬🇧 pills.
- Adding a string: add the key to `src/i18n/translations.ts` with all three locales, then `t("your.key")`.
- Adding a lesson: add its content to `src/data/lessons.ts` **and** its `lesson.{id}.title` / `.description` / `.reflection` keys (plus verse key if new) to translations.
- Lesson page verse translation depends on the `verseKeyMap` (bibleRef → key) in `LessonPage.tsx` — extend it when adding lessons with new references.

---

## 9. Environment & Config

- `.env` (auto-generated, do not edit): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
- `supabase/config.toml` — project ref only; auto-managed.
- Path alias `@/*` → `src/*` (vite.config.ts + tsconfig).
- Dev server: port 8080, HMR overlay disabled.

## 10. Conventions & Gotchas

1. **Never edit** `src/integrations/supabase/*` or `src/integrations/lovable/*` — auto-generated.
2. **Design tokens only** — no hardcoded hex/`text-white`/`bg-black` in components; extend `index.css` tokens instead.
3. **Lesson ids** are semantic strings (`"2-3"`), shared between `data/lessons.ts`, translation keys, and the DB — keep them in sync.
4. **Badge awarding** is client-side inside `useProgress` actions; when migrating to DB-backed progress, port this logic (or move it to a server function).
5. **Streak** uses local `Date.toDateString()` comparisons — timezone-naive by design.
6. Google OAuth `redirect_uri` must remain `window.location.origin` (same-origin); post-login navigation happens after session hydration.
7. `noImplicitAny` is off and `strictNullChecks` is off in tsconfig — be careful with the `as any` casts used for dynamic translation keys.
8. The published app and preview share one backend instance.

## 11. Roadmap / Pending Work

- [ ] Sync `useProgress` state to cloud tables (completed_lessons, journal_entries, user_achievements, user_reading_progress, quiz_answers) and hydrate from DB on login
- [ ] Read lessons/achievements/plans from DB instead of `data/lessons.ts`
- [ ] Logout button on Profile
- [ ] Onboarding flow (name + "what brought you here")
- [ ] Per-day passages for reading plans (`bible_plan_days` content)
- [ ] Test coverage for progress/badge logic
