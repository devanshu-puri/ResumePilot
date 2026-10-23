# ResumePilot — Product Requirements Document

Status: Draft v1 · Requirement IDs are stable; reference them in `PROGRESS.md`.

## 1. Problem
Students list technologies on resumes without knowing which interview questions those claims invite. Resume review, mock interviews and learning resources live in separate tools, so weaknesses found in practice never turn into targeted learning.

## 2. Users
CS/engineering students, internship applicants, recent graduates, early-career developers.

## 3. Goals / Non-goals
**Goals:** (G1) derive resume-grounded questions with traceable sources; (G2) evaluate answers with explainable, criterion-level rubrics; (G3) convert evidenced gaps into structured learning; (G4) show honest, evidence-backed progress; (G5) private by default.
**Non-goals (v1):** recruiter-side features, job matching, resume rewriting/ATS scoring, live code execution, social features, gamified streaks/leaderboards, payments.

## 4. Product principles (binding)
P1 Evidence before assumption · P2 user data from real records only · P3 never fabricate a score/status · P4 deterministic rules in code, subjective feedback labelled as such · P5 every evaluation explains itself · P6 resources lead to activities · P7 user controls data · P8 laptop/tablet/phone · P9 degrade gracefully · P10 few complete workflows > many shallow ones.

## 5. Functional requirements

### Foundation (FND)
- FND-1 Responsive shell with shared nav; public pages (landing, privacy, sign-in).
- FND-2 Authenticated routes; every private record ownership-checked server-side.
- FND-3 Typed errors with safe messages; no resume/answer content in logs.
- FND-4 LLM gateway interface; app works (read-only) when it's unavailable.

### Resume Intelligence (RES)
- RES-1 Upload PDF/DOCX or paste text; validate type, size (default ≤5 MB), readability.
- RES-2 Extract text; unreadable/scanned → explicit `failed_unreadable` state with next steps.
- RES-3 Identify sections, skills (mapped to canonical Topic), projects, claims.
- RES-4 Every claim stores source offsets computed by the app from an exact quote match; unmatched claims are discarded and counted.
- RES-5 User can confirm, edit, exclude any claim/skill; original text always visible next to interpretation.
- RES-6 A skills-list entry never creates an "implemented X" claim.
- RES-7 Retention: original file deleted after extraction; extracted text kept only while resume exists; user can delete resume (cascade).
- RES-8 Choose target role; create question set from selected claims/skills/projects.

### Interview Lab (INT)
- INT-1 Session types: `defense`, `challenge`, `mock` over one engine.
- INT-2 Questions carry topicId, expectedConcepts, versioned rubric; defense questions carry sourceClaimId and must not assume facts outside the claim text.
- INT-3 One question at a time; answer editor by answerFormat (text, code-for-review).
- INT-4 Evaluation per response: criterion results `{criterionId, score, max, evidence, feedback, topicId}`; totals computed in code; bounds validated.
- INT-5 Evaluation states: `submitted → pending → completed | failed | inconclusive`; retry for failed.
- INT-6 Empty responses are not persisted as attempts.
- INT-7 Follow-ups link to parent question + triggering response + rationale; no near-duplicate re-asks (same topic+concept set within session).
- INT-8 Pause/resume; completed-session report with per-criterion breakdown and derived "topics to revisit".
- INT-9 No code is executed; code answers are reviewed and labelled "reviewed, not executed".

### Tech Library (LIB)
- LIB-1 Browse/search by topic, type, difficulty, duration, saved; filters only for populated metadata.
- LIB-2 Resource detail: objectives, prerequisites, attribution/source link, activities, user's real progress and attempts.
- LIB-3 Resources without activity are labelled informational; no dead practice button.
- LIB-4 Activity attempts are immutable, numbered per user+activity; new attempt never overwrites.
- LIB-5 `knowledge_check` graded deterministically; `short_answer` graded by rubric (same evaluation contract as INT-4).
- LIB-6 Progress states: `not_started, in_progress, submitted, passed, needs_review, completed, evaluation_failed`; only reliably determinable ones exposed. One progress row per user+resource; one saved row per user+resource.
- LIB-7 Attempt + progress + evidence written in one DB transaction.
- LIB-8 Opening a resource ≠ mastery; "completed" requires its configured completion policy.

### Evidence Loop (EVD)
- EVD-1 Append-only `TopicEvidence` written by interview evaluation and activity attempts.
- EVD-2 Gap rule v1 (see blueprint §4) implemented as pure, unit-tested functions with version.
- EVD-3 Gap → resource/objective matching by topicId (and ancestor topic fallback), ordered by prerequisite then difficulty.
- EVD-4 Handoff exposes only topicId/criterionIds/evidenceIds, never answer text.
- EVD-5 Retest question selection by `comparabilityKey`, excluding already-answered question ids.
- EVD-6 Before/after view shows raw comparable evidence; no unexplained "mastery %".
- EVD-7 Home Next-Best-Action: deterministic priority list, each with a "because" line citing record links; onboarding state if no data.

### Account (ACC)
- ACC-1 Settings: delete resume, delete all data, export my data (JSON).

## 6. Non-functional requirements
- NFR-1 Keyboard accessible; WCAG AA contrast; focus visible.
- NFR-2 No horizontal overflow ≥320 px; touch targets ≥44 px.
- NFR-3 Rate limits on upload, evaluate, generate endpoints.
- NFR-4 Evaluation p95 latency target: set after measurement (don't promise before measuring).
- NFR-5 All state-changing inputs Zod-validated; DB constraints back them up.
- NFR-6 Timestamps UTC; migrations versioned.

## 7. Success metrics (measured from real data only)
Activation: % new users completing first reviewed resume. Loop: % of sessions producing ≥1 evidenced gap that leads to an attempt within 7 days. Retention: % returning to retest. Quality: evaluator agreement on golden set (see `sponsors/INTEGRATIONS.md`), % evaluations `inconclusive/failed`. Do not publish metrics until instrumented; no placeholder numbers in UI.

## 8. Release criteria (from original acceptance, made testable)
AC-1 upload+review resume · AC-2 claims link to source text · AC-3 question set from confirmed claims · AC-4 full session with persisted evaluations · AC-5 follow-up traceable · AC-6 library with working activities · AC-7 attempts persisted per user · AC-8 completion by explicit rules · AC-9 gap→resource by evidence · AC-10 no fabricated data anywhere · AC-11 cross-user access tests pass · AC-12 critical flows pass on 390 px and 1280 px · AC-13 loading/empty/error/retry states present · AC-14 README setup reproducible.

## 9. Risks
| Risk | Mitigation |
|---|---|
| LLM rubric scoring inconsistent | bounded schema, versioned rubrics, inconclusive state, golden-set regression via agentic-evals |
| Resume parsing quality | user review step is mandatory; unreadable state |
| Prompt injection via resume | untrusted-data framing, no tools, schema-only output |
| Content licensing for library | link-out + original notes only |
| Scope creep | vertical slice rule; deferred list in blueprint §5 |
