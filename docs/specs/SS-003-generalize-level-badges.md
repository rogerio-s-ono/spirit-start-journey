# SS-003 — Generalize level-completion badge logic

**Priority:** P2 (tech debt)
**Effort:** S (~1 hr)
**Sprint:** 1
**Depends on:** none

## Problem

`completeLesson()` in `useProgress.ts` hardcodes two lesson-id arrays (`level0Lessons`, `level1Lessons`) to decide whether to award the `level-1` and `level-2` badges. This only covers levels 0 and 1. Finishing Level 2 or Level 3 awards no badge at all, and any future level added to `data/lessons.ts` would require another hand-written array in `useProgress.ts` — a second place to remember to update.

Note: `data/lessons.ts` currently only defines 2 level-completion badges (`level-1` for finishing level 0, `level-2` for finishing level 1) — there is no `level-3`/`level-4` badge defined yet. This spec only fixes the *mechanism* so it scales; whether to add more level badges to the content data is a product decision (see Out of Scope).

## Acceptance Criteria

- [ ] Level-completion badge checks are derived from `levels` and `lessons` data (loop over all levels, check if every lesson of that level is in `completedLessons`), not from hardcoded per-level arrays.
- [ ] Existing behavior is preserved exactly: completing all of level 0's lessons still awards `level-1`; completing all of level 1's lessons still awards `level-2`.
- [ ] Adding a new level to `data/lessons.ts` with a correctly-named badge (if one is added in the future) requires no change to `useProgress.ts`.
- [ ] No duplicate badge awards on repeated calls.

## Technical Approach

Replace the two hardcoded arrays with a generic loop, mapping level id to its expected badge id via the existing badge `condition` field (e.g. `"level_0_complete"`, `"level_1_complete"` in `data/lessons.ts`) or via a small lookup table `{ [levelId]: badgeId }` if the `condition` string parsing is too fragile. Example:

```ts
levels.forEach((level) => {
  const levelLessons = lessons.filter((l) => l.levelId === level.id).map((l) => l.id);
  const allDone = levelLessons.length > 0 && levelLessons.every((id) => newCompleted.includes(id));
  const badge = badges.find((b) => b.condition === `level_${level.id}_complete`);
  if (allDone && badge && !newBadges.includes(badge.id)) newBadges.push(badge.id);
});
```

This requires importing `levels` and `badges` into `useProgress.ts` alongside the existing `lessons` import (check current imports — `data/lessons.ts` already exports all of these).

## Files to Touch

- `src/hooks/useProgress.ts` — replace hardcoded level-badge arrays with the generic loop in `completeLesson()`.

## Out of Scope

- Deciding whether to add `level-3`/`level-4` badges to `data/lessons.ts` for completing Level 2/3 — that's a content/product decision, not this ticket. If desired, file as a separate small content-only follow-up.

## Testing

- Unit test: completing all level 0 lessons awards `level-1` (regression check).
- Unit test: completing all level 1 lessons awards `level-2` (regression check).
- Unit test: completing all level 2 lessons does NOT crash and does not award a badge that doesn't exist in `badges[]` (since none is defined for level 2 yet).
