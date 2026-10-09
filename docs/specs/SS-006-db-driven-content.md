# SS-006 — Read lessons, achievements, and reading plans from the DB

**Priority:** P1 (roadmap #2)
**Effort:** M (~1-2 days)
**Sprint:** 3
**Depends on:** SS-005 (do this after progress sync works, so one sync pattern is reused)

## Problem

All lesson, quiz, badge, and reading-plan *content* currently lives in the static file `src/data/lessons.ts` and is bundled into the app. The Supabase schema already has equivalent, pre-seeded tables — `lessons`, `quiz_options`, `achievements`, `bible_plans` — but nothing in the frontend reads from them. This means content can't be updated without a code deploy, and the documented architecture (DB as source of truth, per `TECHNICAL_DOCS.md` §6) doesn't match reality.

## Acceptance Criteria

- [ ] `LearningPath.tsx`, `LessonPage.tsx`, `Dashboard.tsx`, and `Profile.tsx` fetch lesson/quiz/achievement/reading-plan content from Supabase instead of importing from `src/data/lessons.ts`.
- [ ] Content fetched from the DB renders identically to what's in `data/lessons.ts` today (the DB is already seeded with matching data per `TECHNICAL_DOCS.md` §6) — this should be a transparent swap, not a visible content change.
- [ ] Translation lookups (`t(\`lesson.${id}.title\`)` etc.) continue to work — DB-driven `id`s must still match the keys already present in `src/i18n/translations.ts` (they should, since ids like `"0-1"` are shared across both today).
- [ ] Use `@tanstack/react-query` (already installed, currently unused per `TECHNICAL_DOCS.md` §2) for these fetches — cache lesson/achievement/plan lists since they rarely change, avoiding refetching on every navigation.
- [ ] `src/data/lessons.ts` can be fully removed once nothing imports from it (or reduced to just TypeScript interfaces if those are reused for the fetched data shape).
- [ ] Loading and error states are handled gracefully (e.g. a simple skeleton/spinner while content loads, not a blank screen).

## Technical Approach

1. Add typed query functions (e.g. `src/lib/queries/lessons.ts`) using the existing Supabase client (`src/integrations/supabase/client.ts`) and the generated types (`src/integrations/supabase/types.ts`) to fetch: all lessons + their quiz_options joined, all achievements, all bible_plans.
2. Wrap each in a `useQuery` hook (react-query) with a long `staleTime` (content changes rarely) — e.g. `useLessons()`, `useAchievements()`, `useReadingPlans()`.
3. Replace the static imports (`import { levels, lessons, badges, readingPlans } from "@/data/lessons"`) in each consuming page with these hooks.
4. Keep the `Lesson`/`Quiz`/`Level`/`QuizOption` TypeScript interfaces (from `data/lessons.ts`) as the shared shape, now populated from the DB response instead of hardcoded objects — only move/rename the file if it stops exporting actual data.
5. Confirm `quiz_options.option_type` ('spiritual'/'balanced'/'worldly') maps correctly to the existing option rendering in `LessonPage.tsx`.

## Files to Touch

- New: `src/lib/queries/*.ts` (or similar) for the Supabase fetch + react-query hooks.
- `src/pages/LearningPath.tsx`, `src/pages/LessonPage.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Profile.tsx` — swap static import for query hook.
- `src/data/lessons.ts` — reduce to interfaces only, or delete, once unused.

## Out of Scope

- Changing the actual content/copy of lessons — this is a data-source swap only.
- Admin UI for editing lesson content in the DB — out of scope, assumed to be managed directly in Supabase for now.
- SS-005's progress-sync work (separate ticket, though both touch Supabase).

## Testing

- Manual: every lesson, quiz, badge, and reading plan screen renders the same content as before the change.
- Verify network tab shows Supabase queries firing once (cached) across navigation between Dashboard/Path/Lesson, not on every render.
