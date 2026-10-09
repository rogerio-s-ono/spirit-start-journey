# Spirit Start — Backlog & Sprint Plan

> Step 3 of the resume-work recap. Derived from the gap analysis (`docs/app-gap-analysis.html`) against the live codebase (commit `bd9b0de`) plus the pending roadmap already documented in `TECHNICAL_DOCS.md` §11.
>
> Each item below has a full spec in `docs/specs/SS-0XX-*.md` — those files are the ready-to-code input. This file only sequences them.

## How to read this

- **Priority:** P0 = broken/blocking, P1 = documented gap or missing basic feature, P2 = planned roadmap work, P3 = cleanup, no user impact.
- **Sprint:** suggested grouping assuming one sprint ≈ what a single developer (or Kiro) can land and verify together. Adjust freely — the dependency order matters more than the sprint numbers.
- Work top to bottom within a sprint; items in the same sprint have no dependency on each other unless noted.

## Sprint 1 — Stabilize what's already built

Fix confirmed bugs and dead logic in the existing local-state system before adding any new storage layer on top of it. All four are small and independent of each other.

| Order | ID | Title | Priority | Effort | Depends on |
|---|---|---|---|---|---|
| 1 | [SS-001](specs/SS-001-fix-dashboard-current-level.md) | Fix Dashboard stuck on Level 0 | P0 | XS | — |
| 2 | [SS-002](specs/SS-002-fix-streak-badge.md) | Fix unearnable "7-Day Journey" badge | P1 | XS | — |
| 3 | [SS-003](specs/SS-003-generalize-level-badges.md) | Generalize level-completion badge logic | P2 | S | — |
| 4 | [SS-004](specs/SS-004-cleanup-dead-code.md) | Remove dead code (orphaned page, unused field) | P3 | XS | — |

**Why first:** SS-005 (cloud sync) will carry this same progress/badge logic into a second storage layer — fixing it once, locally, before duplicating it into Supabase writes avoids syncing bugs to the cloud too.

## Sprint 2 — Close the biggest architecture gap + quick UX fix

| Order | ID | Title | Priority | Effort | Depends on |
|---|---|---|---|---|---|
| 5 | [SS-005](specs/SS-005-cloud-sync-progress.md) | Sync user progress to cloud tables + hydrate on login | P0 | L | SS-001 |
| 6 | [SS-007](specs/SS-007-logout-button.md) | Logout button on Profile | P1 | XS | — |

**Why:** SS-005 is the single largest confirmed gap — 0% of the documented DB schema is actually used for progress today, meaning no user's data survives a new device or cleared browser. SS-007 is unrelated and tiny; slot it in wherever convenient, listed here so it doesn't get lost.

## Sprint 3 — Make content and onboarding DB-driven

| Order | ID | Title | Priority | Effort | Depends on |
|---|---|---|---|---|---|
| 7 | [SS-006](specs/SS-006-db-driven-content.md) | Read lessons/achievements/plans from DB | P1 | M | SS-005 |
| 8 | [SS-008](specs/SS-008-onboarding-flow.md) | Onboarding flow (name + motivation) | P2 | M | SS-005 (recommended) |

**Why after Sprint 2:** both benefit from the sync pattern and Supabase query conventions established in SS-005, avoiding rework.

## Sprint 4 — Depth and safety net

| Order | ID | Title | Priority | Effort | Depends on |
|---|---|---|---|---|---|
| 9 | [SS-009](specs/SS-009-reading-plan-daily-passages.md) | Per-day passages for reading plans | P2 | M | SS-006 (recommended) |
| 10 | [SS-010](specs/SS-010-test-coverage-progress-badges.md) | Test coverage for progress/badge logic | P2 | S-M | SS-001, SS-002, SS-003 |

**Why last:** SS-009 needs plans to already be DB-driven (SS-006) to avoid building per-day content twice. SS-010 should be written against the corrected logic from Sprint 1, not the buggy version — writing tests before the bugs are fixed would just lock in the bugs.

## Open decisions before coding starts

Flagged in the individual specs — resolve before implementation, not during:

- **SS-008:** exact onboarding question/options copy needs product sign-off before translating into pt/es/en.
- **SS-009:** whether to embed scripture text or reference-only + external link, due to translation licensing — confirm before building.

## Full index

| ID | Title | Sprint |
|---|---|---|
| [SS-001](specs/SS-001-fix-dashboard-current-level.md) | Fix Dashboard stuck on Level 0 | 1 |
| [SS-002](specs/SS-002-fix-streak-badge.md) | Fix unearnable "7-Day Journey" badge | 1 |
| [SS-003](specs/SS-003-generalize-level-badges.md) | Generalize level-completion badge logic | 1 |
| [SS-004](specs/SS-004-cleanup-dead-code.md) | Remove dead code | 1 |
| [SS-005](specs/SS-005-cloud-sync-progress.md) | Cloud sync of progress | 2 |
| [SS-007](specs/SS-007-logout-button.md) | Logout button | 2 |
| [SS-006](specs/SS-006-db-driven-content.md) | DB-driven content | 3 |
| [SS-008](specs/SS-008-onboarding-flow.md) | Onboarding flow | 3 |
| [SS-009](specs/SS-009-reading-plan-daily-passages.md) | Reading plan daily passages | 4 |
| [SS-010](specs/SS-010-test-coverage-progress-badges.md) | Test coverage | 4 |
