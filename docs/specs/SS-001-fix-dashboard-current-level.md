# SS-001 — Fix Dashboard stuck on Level 0

**Priority:** P0 (bug)
**Effort:** XS (~30 min)
**Sprint:** 1
**Depends on:** none

## Problem

`progress.currentLevel` is set once at initialization in `useProgress.ts` and never updated. `completeLesson()` adds XP and completed-lesson ids but never advances `currentLevel`. As a result, `Dashboard.tsx` — which reads `levels[progress.currentLevel]` to pick the level title, progress ring, and "next lesson" CTA — always shows Level 0 content, even after the user has completed Level 0 and unlocked Level 1+.

The Learning Path screen (`LearningPath.tsx`) is unaffected: it derives the unlocked/current level correctly from `progress.completedLessons` on every render, not from `progress.currentLevel`.

## Acceptance Criteria

- [ ] After completing all lessons in a level, the Dashboard shows the next unlocked level's title, icon, and progress ring — not the previous level's.
- [ ] `progress.currentLevel` always reflects the highest level the user has unlocked (i.e., the lowest level that is not yet 100% complete, or the last level if all are complete).
- [ ] The "next lesson" CTA on the Dashboard points to the first incomplete lesson of the correct current level.
- [ ] If all 4 levels are complete, the Dashboard shows level 3 (last level) with a "completed" state rather than erroring or showing undefined.
- [ ] No regression to `LearningPath.tsx`'s own (correct) level-unlock logic.

## Technical Approach

Two viable approaches — pick whichever is simplest given the codebase; a derived value is preferred over duplicating stored state:

**Option A (recommended): derive instead of store.**
Remove reliance on the stored `currentLevel` field for display purposes. In `Dashboard.tsx`, compute the active level the same way `LearningPath.tsx` computes `isLevelUnlocked`: find the lowest level id whose lessons are not all completed (fall back to the last level if all are complete). Use that derived value instead of `progress.currentLevel` for the level title, progress ring, and next-lesson lookup.

**Option B: fix the write path.**
Keep `currentLevel` in state but update it inside `completeLesson()`: after marking a lesson complete, check whether all lessons of `prev.currentLevel` are now complete; if so, advance `currentLevel` to the next level id (clamped to the max level).

Prefer Option A — it removes a second source of truth and matches how `LearningPath.tsx` already works, reducing future drift between the two screens.

## Files to Touch

- `src/pages/Dashboard.tsx` — replace `progress.currentLevel` usage with the derived "active level" calculation (extract a small helper, e.g. `getActiveLevel(progress, levels, lessons)`, reusable by both Dashboard and LearningPath if desired).
- `src/hooks/useProgress.ts` — if going with Option A, `currentLevel` field can remain in the stored shape for backward compatibility (don't break existing localStorage data) but should no longer be the source of truth for the Dashboard.

## Out of Scope

- Any change to cloud sync (see SS-005) — this is a local-state-only fix.
- Visual redesign of the Dashboard.

## Testing

- Manual: complete all Level 0 lessons locally, reload the Dashboard, confirm it now shows Level 1.
- Add a unit test for the derived "active level" helper covering: no lessons complete, partial level complete, one level fully complete, all levels complete.
