# SS-005 — Sync user progress to cloud tables + hydrate on login

**Priority:** P0 (roadmap #1 — largest pending backend task)
**Effort:** L (~2-3 days)
**Sprint:** 2
**Depends on:** SS-001 (fix the level logic before wiring it to a second storage layer)

## Problem

`useProgress()` persists everything to `localStorage` only (key `faithjourney-progress`). The Supabase schema already has tables for every piece of this state — `completed_lessons`, `journal_entries`, `user_achievements`, `user_reading_progress`, `quiz_answers`, plus `profiles` for xp/streak/level/name — but a repo-wide search confirms **zero** `supabase.from(...)` calls exist anywhere in the frontend. A user's progress does not survive a cleared browser, a new device, or reinstall. This is the single biggest gap between the documented architecture and the shipped app.

## Acceptance Criteria

- [ ] On login (session available from `useAuth()`), progress is hydrated from Supabase tables instead of (or merged with) `localStorage`.
- [ ] Completing a lesson writes a row to `completed_lessons` (`user_id`, `lesson_id`) and updates `profiles.xp_points` / `profiles.current_level`.
- [ ] Adding a journal entry writes to `journal_entries` (`user_id`, `type`, `content`).
- [ ] Earning a badge writes to `user_achievements` (`user_id`, `achievement_id`).
- [ ] Advancing a reading plan writes/updates `user_reading_progress` (`user_id`, `plan_id`, `current_day`).
- [ ] Answering a quiz writes to `quiz_answers` (`user_id`, `lesson_id`, `selected_option`).
- [ ] Streak/last-visit is persisted to `profiles.streak` / `profiles.last_visit` so streak survives across devices.
- [ ] A user who logs in on a second device/browser sees their actual progress, not a fresh empty state.
- [ ] `localStorage` is still used as an offline-first cache (optional but recommended) so the UI isn't blocked on network round-trips — writes go to both, with Supabase as source of truth on login.
- [ ] All existing RLS policies (owner read/insert/update, per `TECHNICAL_DOCS.md` §6) are respected — no client code bypasses them or requires policy changes for this feature as scoped.
- [ ] Anonymous/logged-out users keep working exactly as today (localStorage only) — this is additive for authenticated users, not a breaking change to the guest experience (if one exists) or during the loading state between login and hydration.

## Technical Approach

1. **Hydration:** When `useAuth()` reports a logged-in `user`, fetch the user's rows from each relevant table (`profiles`, `completed_lessons`, `journal_entries`, `user_achievements`, `user_reading_progress`, `quiz_answers`) and merge into the shape `useProgress` already expects (`UserProgress` interface in `src/hooks/useProgress.ts`). Do this once per session start (e.g. in a `useEffect` keyed on `user?.id`).
2. **Write-through:** Modify each action in `useProgress.ts` (`completeLesson`, `addJournalEntry`, `answerQuiz`, `startReadingPlan`, `advanceReadingPlan`, `setUserName`) to, in addition to updating local state, fire the corresponding Supabase insert/update (`upsert` where the table has a unique constraint, e.g. `completed_lessons` has `unique(user_id, lesson_id)`).
3. **Conflict handling:** On hydration, if both localStorage and the DB have data (e.g. user progressed while offline, or on a browser that still has old localStorage data from before this feature), prefer the DB as source of truth once reachable; consider a one-time migration pass that pushes any localStorage-only entries not yet in the DB up to Supabase (covers users upgrading from the old local-only version) — don't silently discard existing local progress.
4. **Auth types:** `profiles.user_id` already maps 1:1 to `auth.users` via the existing `handle_new_user` trigger — no new tables or migrations should be needed; this is purely wiring the frontend to tables that already exist and are seeded.
5. Regenerate `src/integrations/supabase/types.ts` only if the schema itself needs adjusting (it shouldn't, per the schema documented in `TECHNICAL_DOCS.md` §6) — do not hand-edit that file regardless.

## Files to Touch

- `src/hooks/useProgress.ts` — add Supabase read (hydration) and write (per-action sync) calls.
- `src/hooks/useAuth.ts` — expose whatever is needed (likely just `user.id`, already available) for `useProgress` to key its queries.
- Do not touch `src/integrations/supabase/*` by hand — only regenerate if an actual schema change is required (not expected here).

## Out of Scope

- Reading lesson/achievement/plan *content* from the DB instead of `data/lessons.ts` — that's SS-006, a separate ticket, even though it touches some of the same tables.
- Any UI changes beyond what's needed to not block on network latency (e.g. optimistic updates) — keep the existing UI, just change where state is persisted.
- Real-time sync across open tabs/devices (polling or realtime subscriptions) — out of scope unless explicitly requested later.

## Testing

- Manual: complete a lesson, log out, log back in (or open in a private window with the same account), confirm the lesson still shows completed.
- Manual: add a journal entry, reload, confirm it persists via the DB (temporarily clear localStorage to prove it's not just the local cache).
- Unit/integration test (where Vitest setup allows mocking Supabase client) for at least `completeLesson` and `addJournalEntry` write paths.
