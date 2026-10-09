# SS-008 — Onboarding flow (name + "what brought you here")

**Priority:** P2 (roadmap #4)
**Effort:** M (~1 day)
**Sprint:** 3
**Depends on:** SS-005 recommended first (so onboarding answers can be persisted to the DB rather than added to the localStorage-only model and then redone)

## Problem

Today, a new user signs up (email or Google) and lands directly on the Dashboard with no name set — `Profile.tsx` prompts for a name only reactively (`editingName` defaults to true if `userName` is empty), and there's no capture of *why* the user is here, which could inform content personalization later. `TECHNICAL_DOCS.md` roadmap explicitly calls for an onboarding flow capturing name + motivation.

## Acceptance Criteria

- [ ] After first successful signup (email or Google) — not on every login — the user sees a short onboarding step before reaching the Dashboard.
- [ ] Onboarding asks for: (1) display name (if not already provided at signup, e.g. Google OAuth may already supply one), (2) a single question "What brought you here?" with a small set of options (e.g. aligned with the existing quiz-option tone: curious about faith / new believer / returning to faith / supporting someone else — confirm exact copy with product/user before finalizing strings).
- [ ] Answers are saved: name via existing `setUserName` (and persisted per SS-005 once that's in place), motivation answer stored in `profiles` (new column) or a simple existing mechanism — if SS-005 isn't done yet, store both in localStorage via `useProgress` for now and migrate when SS-005 lands.
- [ ] Onboarding only shows once per user — track via a flag (e.g. `profiles.onboarded boolean` once SS-005 lands, or a localStorage flag in the interim) so returning users skip straight to Dashboard.
- [ ] Follows existing design system (celestial/gold theme, Framer Motion stagger patterns used elsewhere) and is translated in all 3 locales.
- [ ] Skippable (a "skip" affordance) so it never fully blocks access to the app.

## Technical Approach

1. Add a new route or a conditional full-screen step rendered before the Dashboard (similar pattern to `Welcome.tsx`'s mode-switching, or a new `src/pages/Onboarding.tsx` route guarded to show only when `!progress.userName` or `!onboarded` flag, right after auth, before the normal protected routes).
2. If SS-005 is already done: add an `onboarded boolean default false` column to `profiles` (migration) and a `motivation text` column (or a small lookup table if more structure is wanted — keep simple, a text/enum column is enough for v1); update on onboarding completion.
3. If SS-005 is not yet done: store `onboarded: boolean` and `motivation: string` in the existing `UserProgress` shape in `useProgress.ts`, to be migrated to the DB columns later.
4. Add new translation keys for the onboarding copy and options.

## Files to Touch

- New: `src/pages/Onboarding.tsx` (or equivalent component).
- `src/App.tsx` — routing/guard logic to show onboarding once, before Dashboard.
- `src/hooks/useProgress.ts` (interim) or Supabase migration + `useProgress.ts`/`useAuth.ts` (if after SS-005).
- `src/i18n/translations.ts` — new keys (pt/es/en).

## Out of Scope

- Using the motivation answer to actually personalize content/recommendations — just capture it for now; using it is a future ticket.
- Multi-step onboarding wizard — keep this to 1-2 short screens max.

## Testing

- Manual: sign up as a new user, confirm onboarding appears once, confirm it does not reappear on next login.
- Manual: existing users (already has a `userName` set / already `onboarded`) go straight to Dashboard, no regression.
