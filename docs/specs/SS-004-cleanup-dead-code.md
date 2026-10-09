# SS-004 — Remove dead code (orphaned scaffold page, unused field)

**Priority:** P3 (cleanup)
**Effort:** XS (~15 min)
**Sprint:** 1
**Depends on:** none

## Problem

Two small pieces of dead code were confirmed during the gap analysis:

1. `src/pages/Index.tsx` is the default Lovable/Vite "Blank App" placeholder page left over from project scaffolding. It is not imported by `src/App.tsx` and not reachable by any route.
2. Each entry in `levels[]` (`src/data/lessons.ts`) carries a `requiredXp` field (100/200/250/300), but level unlocking in `LearningPath.tsx` (`isLevelUnlocked`) is based entirely on lesson completion, never on XP. The field is currently inert.

## Acceptance Criteria

- [ ] `src/pages/Index.tsx` is deleted (confirm no imports reference it anywhere in the repo before deleting).
- [ ] `requiredXp` is either (a) removed from the `Level` interface and all 4 level objects in `data/lessons.ts`, or (b) kept and explicitly wired into `isLevelUnlocked` as an additional gating condition — pick (a) unless product wants XP-gating as a real feature (if so, that's a separate, larger ticket — don't scope-creep this one).
- [ ] App builds and all existing routes still work after the removal.

## Technical Approach

- Grep the repo for `Index` and `requiredXp` to confirm no other references before removing.
- Delete `src/pages/Index.tsx`.
- Remove `requiredXp` from the `Level` interface and the 4 level object literals in `src/data/lessons.ts`.

## Files to Touch

- `src/pages/Index.tsx` (delete)
- `src/data/lessons.ts` (remove `requiredXp` field from interface + 4 entries)

## Out of Scope

- Any XP-gating feature — if that's wanted later, it should be scoped and speced on its own.

## Testing

- `npm run build` succeeds with no missing-import errors.
- Manual smoke test: all 7 routes still load correctly.
