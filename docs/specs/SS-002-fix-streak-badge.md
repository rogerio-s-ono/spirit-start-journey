# SS-002 — Fix unearnable "7-Day Journey" badge

**Priority:** P1 (bug)
**Effort:** XS (~20 min)
**Sprint:** 1
**Depends on:** none

## Problem

The badge `week-streak` ("7-Day Journey", awarded for a 7-day streak) is defined in `src/data/lessons.ts` and displayed on the Profile page, but no code path ever adds `"week-streak"` to `progress.earnedBadges`. Streak increments happen only in the `useProgress` state initializer (on mount, comparing `lastVisit` to today/yesterday), which has no badge-award logic attached to it. This badge can never be earned, regardless of how long a user uses the app.

## Acceptance Criteria

- [ ] When a user's `streak` reaches 7 or more, `"week-streak"` is added to `progress.earnedBadges` (once — no duplicates).
- [ ] The badge check happens at the point the streak is computed/updated (app load / day change), not only when other actions run.
- [ ] Existing users who already have `streak >= 7` in their stored progress receive the badge on their next load (no manual reset required).
- [ ] No other badge logic is altered.

## Technical Approach

In `useProgress.ts`, the streak is currently computed inline inside the `useState` initializer function. Move the streak-badge check into that same computation (or into a `useEffect` that runs whenever `progress.streak` changes) so that whenever the computed/updated streak is `>= 7` and the badge isn't already present, it gets appended to `earnedBadges`.

Example shape (adapt to existing style, don't introduce new patterns):
```ts
// after computing the new streak value, before returning the initial/updated state:
const badges = [...(parsed.earnedBadges ?? [])];
if (newStreak >= 7 && !badges.includes("week-streak")) badges.push("week-streak");
```

Apply this both in the initializer (for returning users) and in whatever future place re-evaluates streak (if streak logic is ever moved to a cloud-synced effect per SS-005, port this check along with it).

## Files to Touch

- `src/hooks/useProgress.ts` — add the badge check next to streak calculation in the state initializer.

## Out of Scope

- Changing streak calculation rules (same-day/yesterday/reset logic stays as-is).
- Any other badge's award logic.

## Testing

- Unit test: given stored progress with `streak: 6` and `lastVisit` = yesterday, after re-init the streak becomes 7 and `earnedBadges` includes `"week-streak"`.
- Unit test: given stored progress already at `streak: 10` without the badge, loading the hook adds the badge without duplicating it on subsequent loads.
