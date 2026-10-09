# SS-009 — Per-day passages for reading plans

**Priority:** P2 (roadmap #5)
**Effort:** M (~1 day, mostly content entry)
**Sprint:** 4
**Depends on:** SS-006 recommended first (plans should already be DB-driven before adding per-day content, to avoid doing this twice)

## Problem

Reading plans (`John`, `Mark`, `Psalms`, `Proverbs`) currently track only a chapter *count* (`user_reading_progress.current_day` / `readingPlans[planId]` locally) — tapping "+1" just increments a number with no actual passage text, verse reference, or reading content shown to the user. `TECHNICAL_DOCS.md` roadmap calls for real per-day passage content (referred to there as `bible_plan_days`).

## Acceptance Criteria

- [ ] Each reading plan has real per-day/per-chapter content: at minimum a chapter/day label and a way to actually read or reference the passage (either embedded text, or a reference the user can look up — confirm with product whether full Bible text should be embedded or just reference + external link, for licensing/scope reasons).
- [ ] Profile's reading-plan card, when a plan is in progress, shows the current day's specific passage reference (e.g. "John 3" not just "5 / 21 chapters").
- [ ] Advancing a plan (`advanceReadingPlan`) moves the user to the next day's passage.
- [ ] Data model: a `bible_plan_days` table (`plan_id` FK, `day_number`, `reference`, optional `passage_text` or `external_url`) — new migration required.
- [ ] Existing `readingPlans` chapter-count display remains as a secondary summary (e.g. "Day 5 of 21") alongside the new passage detail.

## Technical Approach

1. **Confirm scope with product first:** embedding full scripture text raises licensing questions depending on translation; the safer default is reference-only (e.g. "John 3:1-21") possibly with a link to an external Bible reader (e.g. Bible Gateway) rather than embedding copyrighted text. Flag this explicitly before implementation — do not embed third-party scripture text without confirming license terms for the translation used.
2. Add `bible_plan_days` table via Supabase migration: `id`, `plan_id` (FK → `bible_plans.id`), `day_number`, `reference` (text), optionally `external_url`.
3. Seed it for all 4 existing plans (21 + 16 + 150 + 31 = 218 rows — generate programmatically from chapter numbers rather than hand-entering, e.g. day N → "John N" for the John plan).
4. Fetch the current day's row in `Profile.tsx` (or wherever reading plan detail is shown) via the same query pattern established in SS-006.
5. Update `advanceReadingPlan` call sites to also reflect the new day's reference in the UI immediately (optimistic update acceptable).

## Files to Touch

- New Supabase migration for `bible_plan_days`.
- `src/pages/Profile.tsx` — show current day's passage reference.
- Query layer added in SS-006 (extend with a `useReadingPlanDay(planId, day)` hook or similar).

## Out of Scope

- Embedding a full in-app Bible reader — reference + optional external link only, pending the licensing confirmation above.
- Reading plans beyond the existing 4 (John, Mark, Psalms, Proverbs).

## Testing

- Manual: start a plan, confirm day 1's reference shows; advance, confirm it updates to day 2's reference; reach the final day, confirm a "plan complete" state.
