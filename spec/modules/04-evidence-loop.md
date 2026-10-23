# Module 04 — Evidence Loop (the connector)

**Purpose:** make interview gaps, library learning, retesting, and the home page one coherent system. **Depends on:** 00; integrates 02 and 03.

## Owns
`TopicEvidence` table, `modules/evidence/{domain,service}`, the handoff DTO, retest selection, Home Next-Best-Action.

## Domain functions (pure, versioned)
- `computeGaps(evidence[], rule=v1) → Gap[]` (blueprint §4)
- `matchResources(gap, resources, prereqGraph) → ranked[]` — topic exact, then ancestor topic; order: unmet prerequisite first, then difficulty ascending, then has-activity first
- `selectRetest(topic, comparabilityKey, answeredQuestionIds, bank) → Question|null` (null → UI says no comparable question available yet; never fabricate)
- `beforeAfter(topic, evidence[]) → {before[], after[], comparable:boolean}`
- `nextBestAction(state) → Action` — priority: in-progress session → unreviewed resume claims → open gap with matched activity → retest eligible → start (no resume) diagnostic → upload resume

## Handoff DTO (privacy contract)
`{ topicId, criterionIds[], evidenceIds[], gapRuleVersion }` — **no text fields**. Test asserts the DTO has no string field beyond ids/enums.

## UI contributions
Home NBA panel · "Topics to revisit" list · EvidenceChip component · before/after panel on topic page (`/library/topic/:slug`).

## Tasks & acceptance
| ID | Task | Acceptance |
|---|---|---|
| EVD-T1 | `TopicEvidence` schema + idempotent writer | Duplicate write of same source is a no-op |
| EVD-T2 | Gap rule v1 + constants file | Table-driven tests: 1 low score ≠ gap; 2 low = gap; later pass closes it |
| EVD-T3 | Resource matching | Prereq-first ordering test; no-match → explicit empty |
| EVD-T4 | Handoff DTO + route params | Leak test |
| EVD-T5 | Retest selection | Never returns an answered question; comparabilityKey equality |
| EVD-T6 | Before/after view | Hidden unless comparable evidence on both sides |
| EVD-T7 | Home NBA | Snapshot tests per state; every action has a `because` with ≥1 real record link |
| EVD-T8 | Cross-user isolation | Evidence never visible across users |

## Definition of Done
AC-9, AC-10 demonstrable; journey 4 e2e passes.
