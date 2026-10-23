# Module 02 — Adaptive Interview Lab

**Purpose:** practise defending the resume; get explainable, criterion-level feedback. **Depends on:** 00, 01. **Feeds:** 04 (evidence).

## One engine, three entry points
`sessionType`: `defense` (claim-grounded), `challenge` (topic/difficulty), `mock` (ordered mix, with summary). Same state machine, same response/evaluation pipeline.

## Entities
Question (topicId required, rubricId+version, comparabilityKey, claimTextSnapshot), QuestionSet, QuestionSetItem, InterviewSession, InterviewResponse, Evaluation, CriterionResult, FollowUp. See `ARCHITECTURE.md §3`.

## Question generation
Input: confirmed claim text (+ immediate section context), topic, target role, difficulty. Output (Zod): `questionText, expectedConcepts[], rubricRef, estimatedDurationSeconds`. Post-checks in code: no technology named in the question outside claim ∪ topic aliases; duplicates (same topic + same concept set) rejected. Rubrics are **authored, versioned templates** selected by `questionType` (conceptual, resume_defense, code_explanation); the LLM does not invent rubrics.

## Evaluation
See `ARCHITECTURE.md §5`. Outputs `CriterionResult` rows + `TopicEvidence` rows in one transaction. Inconclusive is a first-class result: UI shows "Not scored — <reason>" and still keeps the answer.

## Follow-ups
Generated only after a **completed** evaluation. Types: probe unclear, justify decision, edge case, complexity, trade-off, prerequisite-simplify. Stored with `parentQuestionId, triggeringResponseId, rationale, followUpType`. Max 2 per parent. Prerequisite follow-up used when core-criterion ratio < 0.4.

## API
`POST /api/question-sets` · `POST /api/interview-sessions` · `GET /api/interview-sessions/:id` · `POST /api/interview-sessions/:id/responses` · `POST /api/interview-responses/:id/evaluate` · `POST /api/interview-responses/:id/follow-ups` · `PATCH /api/interview-sessions/:id` (pause/resume/complete).

## UI
Mode picker (only modes with data: defense needs confirmed claims) → config (topics, difficulty, target role) → question workspace → evaluation breakdown → follow-up → session progress (Stepper) → completed report (per-criterion table, "Topics to revisit" with EvidenceChips, link to Module 03 via Module 04 handoff).

## Code answers
Stored and reviewed by rubric `code_explanation`/`code_review`. Banner: "Reviewed, not executed." No execution infrastructure in v1.

## Tasks & acceptance
| ID | Task | Acceptance |
|---|---|---|
| INT-T1 | Schema + migration | Constraints: score within max; one evaluation per response |
| INT-T2 | Rubric templates + versioning + loader | Rubric id+version immutable once used; test |
| INT-T3 | `aggregateScore()` + bounds validation (pure) | Property tests; out-of-range → rejected |
| INT-T4 | Session state machine (pure) | Illegal transitions rejected; pause/resume preserves position |
| INT-T5 | Question generation service + post-checks | Fake gateway: hallucinated tech rejected; duplicate rejected |
| INT-T6 | Response persistence | Empty/whitespace response → 422, nothing persisted |
| INT-T7 | Evaluation service (LLM rubric) + repair + inconclusive | Invalid JSON ×2 → `inconclusive`; no score stored |
| INT-T8 | Evidence write in same transaction | Failure mid-way leaves no partial evidence |
| INT-T9 | Follow-up service + linkage | Follow-up row references triggering response; dedupe test |
| INT-T10 | UI: workspace, breakdown, session report | e2e journey 2 passes at 390 px and 1280 px |
| INT-T11 | Authorization tests | Other user's session/response/evaluation → 404 |

## Definition of Done
AC-4, AC-5 demonstrable end-to-end; evaluator golden-set run recorded (see `sponsors/INTEGRATIONS.md`).
