# Module 03 — Tech Library & Practice Studio

**Purpose:** structured learning with measurable activities. **Depends on:** 00. **Works standalone** (cold start). **Feeds:** 04.

## Content policy
Curated seed in repo (`content/`): topics, resources with **attribution + canonicalUrl**, original short learning notes (`internal_learning_note`), objectives, activities. No copied third-party articles. Every resource has ≥1 objective; activities optional.

## Entities
Topic (shared), Prerequisite, LearningResource, ResourceTopic, LearningObjective (+ `topicId`), PracticeActivity, ActivityAttempt, LearningProgress, SavedResource. Objective progress is **derived** (no table).

## Activity types in MVP
| Type | Response | Evaluator |
|---|---|---|
| knowledge_check | selected options | deterministic in code; `completionPolicy`: min ratio (e.g. ≥0.8) |
| short_answer | text | rubric-LLM (same contract as INT-4) |
Other types are not shown in UI until implemented.

## Completion rules (pure functions)
- Resource opened → `in_progress` only if user starts an activity or explicitly marks started; viewing alone records `lastAccessedAt`.
- Attempt submitted → `submitted`; evaluation done → `passed` if policy met else `needs_review`; evaluator failure → `evaluation_failed` (retry allowed).
- Resource `completed` when its `completionPolicy` is satisfied (default: every required activity has a `passed` attempt). No activities → never "completed", stays informational.
- Attempt numbering: `max(attemptNumber)+1` per user+activity, inside transaction with unique index.

## API
`GET /api/resources` (filters: topic, type, difficulty, maxMinutes, saved) · `GET /api/resources/:id` · `POST /api/activities/:id/attempts` · `POST /api/attempts/:id/submit` · `PUT/DELETE /api/resources/:id/save` · `GET /api/users/me/learning-progress`.

## UI
Library list with filter bar (only populated facets) · resource detail (objectives, prerequisites, attribution, activities or "Informational only", attempts table) · activity workspace · attempt result (score breakdown, explanation) · saved list. Gap context banner when arriving from Module 04: "Recommended because of your answers on <Topic>" with EvidenceChips (no answer text).

## Tasks & acceptance
| ID | Task | Acceptance |
|---|---|---|
| LIB-T1 | Schema + migration + constraints | Unique progress and saved per user+resource; topic≠prereq check |
| LIB-T2 | Content loader/seed (validated by Zod; fails CI on invalid content) | CI fails on missing attribution or objective without topic |
| LIB-T3 | Filters/search service | Facet shown only if populated; empty-result state |
| LIB-T4 | `nextAttemptNumber`, `statusTransition`, `resourceCompletion` (pure) | Exhaustive transition tests incl. invalid |
| LIB-T5 | Deterministic evaluator for knowledge_check | Bounds + policy tests |
| LIB-T6 | Rubric evaluator for short_answer (reuse INT contract) | Inconclusive path tested |
| LIB-T7 | Attempt submit transaction (attempt+progress+evidence) | Injected failure → nothing partially written |
| LIB-T8 | Library + detail + activity UI | e2e journey 3; journey 5 at 390 px |
| LIB-T9 | Authorization tests | Other user's attempts/progress/saved → 404/empty |

## Definition of Done
AC-6, AC-7, AC-8 demonstrable.
