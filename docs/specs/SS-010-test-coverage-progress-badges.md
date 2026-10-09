# SS-010 — Test coverage for progress/badge logic

**Priority:** P2 (roadmap #6)
**Effort:** S-M (~1 day)
**Sprint:** 4 (after SS-001/002/003 land, so tests cover the corrected logic, not the buggy version)
**Depends on:** SS-001, SS-002, SS-003

## Problem

Vitest + Testing Library + Playwright are installed and configured (`npm run test`, `npm run test:watch`) but `TECHNICAL_DOCS.md` explicitly notes "minimal coverage." The highest-risk logic in the app — XP/level progression, streak calculation, and badge awarding in `useProgress.ts` — has no automated tests today, which is exactly the kind of logic that silently regresses (as seen with SS-001/002).

## Acceptance Criteria

- [ ] Unit tests exist for `useProgress.ts` covering:
  - `completeLesson`: XP accumulates correctly, duplicate completion is a no-op, `first-lesson` / `five-lessons` badges award at the right thresholds, level-completion badges award correctly (post SS-003 generalization), derived current-level logic (post SS-001) for partial/full/all-levels-complete states.
  - Streak initializer: same-day visit keeps streak, consecutive-day visit increments, gap resets to 1, `week-streak` badge awards at streak >= 7 (post SS-002).
  - `addJournalEntry`: entry is prepended, `first-prayer`/`first-reflection` badges award once.
  - `answerQuiz`, `startReadingPlan`, `advanceReadingPlan`: state updates as expected, `bible-reader` badge awards once on plan start.
- [ ] Tests use Vitest + Testing Library's `renderHook` (or equivalent) against the real `useProgress` hook, mocking `localStorage` (and Supabase, if SS-005 has landed by this point) rather than re-implementing the logic in the test.
- [ ] `npm run test` passes with the new suite included, with no flakiness from relying on real system date — mock `Date`/`Date.now()` where streak logic is tested.
- [ ] Coverage of `useProgress.ts` specifically should be high (aim for all branches in badge-award conditionals) even if overall project coverage isn't tracked as a gate.

## Technical Approach

- Add `src/hooks/useProgress.test.ts` (or `.spec.ts`, match existing convention if any test files already exist — check for a `vitest.config.ts`/existing `*.test.*` pattern first).
- Use `@testing-library/react`'s `renderHook` and `act` to call the hook's actions and assert on returned `progress`.
- Mock `localStorage` per-test (reset between tests) and mock `Date` (e.g. via `vi.setSystemTime`) for streak-related cases.
- If SS-005 has landed by the time this is picked up, mock the Supabase client calls so these remain fast, isolated unit tests — leave end-to-end DB verification to a separate Playwright test if desired (not required for this ticket).

## Files to Touch

- New: `src/hooks/useProgress.test.ts`.
- Possibly `src/hooks/useProgress.ts` if minor refactors are needed to make logic more testable (e.g. extracting the "active level" helper from SS-001 into its own exported function) — keep such refactors minimal and behavior-preserving.

## Out of Scope

- End-to-end Playwright coverage of the full lesson-completion UI flow — this ticket is unit-level logic only. A follow-up E2E ticket can be filed separately if wanted.
- Testing `data/lessons.ts` content itself (static data, no logic to test) — unless SS-006 has moved this to a DB query layer, in which case that layer's tests are a separate concern.

## Testing

- `npm run test` runs the new suite and all assertions pass.
- `npm run test:watch` works for local iteration (sanity check, not a deliverable).
