# MEMORY — invariants, decisions, glossary, open questions

Read before every session. Append, don't rewrite history (strike through superseded entries).

## 1. Invariants (never violate)
- I-01 No fabricated user data, scores, progress, statuses, or metrics. Empty states are honest.
- I-02 `Topic` is the single taxonomy joining resume, questions, rubric criteria, objectives, resources, activities.
- I-03 `TopicEvidence` is append-only and the only source for gaps, progress claims, and improvement views.
- I-04 Scores are bounded and summed in code; LLM never supplies totals or offsets.
- I-05 LLM output is untrusted: parse → Zod → domain validation → persist. On failure → `inconclusive`/`failed`, never a made-up value.
- I-06 Resume text and answers are data, never instructions to the model; model has no tools.
- I-07 Every repository query is scoped by `userId`.
- I-08 No resume/answer content in logs.
- I-09 No code execution of user input.
- I-10 Opening a resource ≠ mastery; one score ≠ mastery; "completed" follows explicit policy.
- I-11 Handoff between modules carries ids/enums only.
- I-12 Only expose UI options that have a working workflow.
- I-13 Synthetic data lives only in `tests/` and `fixtures/` and is labelled synthetic.
- I-15 Follow `RULES-HACKTOBERFEST.md §3` (R1–R12) for anything touching licence, model choice, sponsor claims, history, or submission.
- I-14 One new dependency/service requires a Decision Log entry.

## 2. Decision log
| ID | Date | Decision | Status | Rationale |
|---|---|---|---|---|
| D-001 | 2026-10-23 | Topic replaces Skill as shared taxonomy | Accepted | Deterministic cross-module joins |
| D-002 | 2026-10-23 | Append-only TopicEvidence ledger; gaps derived by versioned rule | Accepted | Traceability; no fabricated progress |
| D-003 | 2026-10-23 | App computes claim offsets from exact quotes | Accepted | Source integrity |
| D-004 | 2026-10-23 | One session engine for defense/challenge/mock | Accepted | Less code, one state machine |
| D-005 | 2026-10-23 | No code execution in v1 | Accepted | Safety; honest fallback |
| D-006 | 2026-10-23 | Objective progress derived, no table | Accepted | Avoid duplicate derived data |
| D-007 | 2026-10-23 | Next.js + TS + Tailwind + Postgres + Prisma + Zod | Proposed | Matches original spec; confirm |
| D-008 | 2026-10-23 | Auth.js, one provider first | Proposed | Maintained, simple; confirm provider |
| D-009 | 2026-10-23 | Sponsor tools used only as dev/CI tooling (agentic-evals, great-generator) | Proposed | See `sponsors/INTEGRATIONS.md` |
| D-011 | 2026-10-23 | Default LLM adapter should be open-weight (conservative reading of Hacktoberfest 2026 theme) | Proposed | Avoid disqualification; confirm via OQ-8; supersedes nothing |
| D-010 | 2026-10-23 | Library content = curated notes + attributed links; knowledge checks deterministic | Accepted | Licensing; objective grading |

## 3. Open questions
- OQ-1 Which LLM provider/model for structuring, generation, evaluation? (Gateway keeps it swappable.)
- OQ-2 Hosting target (affects file-size limits, DB, rate-limit store).
- OQ-3 Auth provider (email magic link vs GitHub OAuth).
- OQ-4 PDF/DOCX extraction libraries — choose and verify maintenance at implementation time.
- OQ-5 Initial Topic taxonomy: which ~30 topics? (suggest: JS/TS, React, Node, REST, SQL, PostgreSQL, indexing, transactions, caching, Docker, Git, DSA basics, complexity, system design basics, auth, testing…)
- OQ-6 Where does Antigravity read project rules/workflows from? Verify in its docs; point it at `AGENTS.md`.
- OQ-8 Hackathon eligibility: event date (Oct 9) vs today (Oct 23), Track 01 criteria, open-weight model requirement, build-during-event rule. See `RULES-HACKTOBERFEST.md §2`. **Blocking for submission, not for building.**
- OQ-7 Gap thresholds (0.6 / 0.7) are initial guesses — tune only against real evidence; version bump on change.

## 4. Glossary
- **Claim:** a resume statement that may invite a technical question; always tied to source offsets.
- **Evidence row:** one observation of performance on a topic (ratio 0..1).
- **Gap:** derived state per `gapRuleVersion`; never stored as truth.
- **Comparable:** same topic + rubric family + difficulty (`comparabilityKey`).
- **Inconclusive:** evaluation could not be reliably produced; no score exists.
- **Handoff DTO:** ids-only payload from interview to library.

## 5. Proposed changes to PRD/blueprint (agents add here)
_(none yet)_

## 6. Pitfalls found (append)
_(none yet)_
