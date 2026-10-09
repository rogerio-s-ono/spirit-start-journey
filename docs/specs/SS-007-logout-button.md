# SS-007 — Logout button on Profile

**Priority:** P1 (roadmap #3)
**Effort:** XS (~30 min)
**Sprint:** 2
**Depends on:** none

## Problem

`useAuth()` already exposes a working `signOut()` function (`src/hooks/useAuth.ts`), but no screen calls it. There is currently no way for a user to log out of the app from the UI.

## Acceptance Criteria

- [ ] Profile page (`src/pages/Profile.tsx`) has a visible "Log out" button/action.
- [ ] Tapping it calls `useAuth().signOut()`.
- [ ] After sign-out, the user is redirected to `/welcome` (should happen automatically via the existing `ProtectedRoute` guard in `App.tsx` once `user` becomes `null` — confirm this, don't add a duplicate manual redirect that could race with it).
- [ ] Button follows the existing design system (gold/celestial tokens, no hardcoded colors) and existing button patterns already used on the Profile page.
- [ ] Button is translated via `useLanguage()`/`t()` — add a `profile.logout` key to all three locales in `src/i18n/translations.ts` (pt/es/en).

## Technical Approach

Add a button near the bottom of the Profile page (after the reading plans section, or in the header area near the name — match existing visual hierarchy) that calls `signOut` from `useAuth()`. No new routing logic should be needed since `ProtectedRoute` already redirects unauthenticated users to `/welcome`.

## Files to Touch

- `src/pages/Profile.tsx` — import `useAuth`, add logout button/handler.
- `src/i18n/translations.ts` — add `profile.logout` key (pt/es/en).

## Out of Scope

- Any "are you sure?" confirmation dialog — keep it a single tap unless product wants confirmation (not specified, skip for v1).
- Clearing localStorage progress on logout — current behavior (keeping local cache) should remain unless SS-005 changes the storage model, in which case re-evaluate.

## Testing

- Manual: log in, go to Profile, tap logout, confirm redirect to Welcome and that re-visiting any protected route redirects back to Welcome.
