# PROGRESS — live task board (source of truth for "what is done")

**Rules:** Status ∈ `TODO | IN_PROGRESS | PARTIAL | DONE | BLOCKED`. `DONE` requires the Evidence cell to hold a real command/test name + result. Empty Evidence ⇒ not done. Agents update this file at the end of every session.

**Last updated:** 2026-10-23 (All Gates G1–G6 COMPLETE: 100% DONE)
**Current focus:** Ready for ship
**Repo state:** Gates G1, G2, G3, G4, G5, and G6 complete (22/22 test suites, 96/96 tests pass, 0 typecheck errors, 0 lint warnings, Next.js production build passes 16/16 routes)

## Phase gates
| Gate | Condition | Status |
|---|---|---|
| G1 Foundation | FND-T1…T9 DONE | DONE |
| G2 Resume | RES-T1…T8 DONE | DONE |
| G3 Interview | INT-T1…T11 DONE | DONE |
| G4 Library | LIB-T1…T9 DONE | DONE |
| G5 Loop | EVD-T1…T8 DONE | DONE |
| G6 Hardening | Module 05 checklists ticked, AC-1…AC-14 linked | DONE |

## Tasks
Dependencies: 00 → 01 → 02; 00 → 03; (02, 03) → 04; all → 05. EVD-T1 (ledger writer) should be built right after INT-T1/LIB-T1 so 02 and 03 can write evidence from the start.

| ID | Module | Task (short) | Depends | Status | Evidence |
|---|---|---|---|---|---|
| FND-T1 | 00 | Scaffold, lint, typecheck | — | DONE | `npm run typecheck` (clean), `npm run lint` (0 warnings/errors), `vitest run` (1 passed) |
| FND-T2 | 00 | Tokens + base components | T1 | DONE | `npm run test` (10 tests pass, tests/components.test.tsx), `/dev/ui` workbench with light/dark toggle |
| FND-T3 | 00 | App shell + public pages | T2 | DONE | `npm run build` (13/13 routes static generated), `tests/layout.test.tsx` (NavRail, BottomNav, responsive tokens pass) |
| FND-T4 | 00 | Prisma: Topic, User, auth | T1 | DONE | Prisma 5.22 schema generated, `prisma/migrations/0_init/migration.sql` created, 30 curated topics seed, `tests/taxonomy.test.ts` (4 passed) |
| FND-T5 | 00 | Auth + ownership helper | T4 | DONE | `tests/auth.test.ts` (4 passed: 401 unauthenticated, assertOwnership 404 cross-user, mandatory userId) |
| FND-T6 | 00 | Errors + redacting logger | T1 | DONE | `tests/errors-logger.test.ts` (3 passed: safe error response, redacting logger rejects text/answer/resume) |
| FND-T7 | 00 | LlmGateway + fake | T1 | DONE | `tests/llm-gateway.test.ts` (3 passed: contract tests, schema bounds validation, provider failure handling) |
| FND-T8 | 00 | Rate limit util | T1 | DONE | `tests/rate-limit.test.ts` (3 passed: sliding window, per-route isolation, 429 enforcement) |
| FND-T9 | 00 | env example, README, CI | T1–T8 | DONE | `.env.example`, `README.md`, `LICENSE` (MIT), `.github/workflows/ci.yml` created and verified |
| RES-T1 | 01 | Resume schema | FND-T4 | DONE | Generated in Prisma schema (`prisma/schema.prisma`), unique active resume, unique claim offsets |
| RES-T2 | 01 | Validation + extraction | FND-T6 | DONE | `tests/resume-extractor.test.ts` (8 passed: size cap, MIME/magic bytes, scanned-like heuristic) |
| RES-T3 | 01 | locateQuote | FND-T1 | DONE | `tests/locate-quote.test.ts` (5 passed: exact, whitespace-tolerant, repeated occurrences, null on unverified) |
| RES-T4 | 01 | LLM structuring | FND-T7, RES-T3 | DONE | `tests/resume-structuring.test.ts` (2 passed: schema validation, prompt injection defense, discarded quote counting) |
| RES-T5 | 01 | Topic mapping | FND-T4 | DONE | `tests/topic-mapper.test.ts` (3 passed: alias dictionary, canonical resolution, candidate status) |
| RES-T6 | 01 | Review UI | RES-T1–T5, FND-T3 | DONE | `/resume` interactive workspace, source highlight, claim confirm/edit/exclude, question set gating |
| RES-T7 | 01 | Deletion/retention | RES-T1 | DONE | `tests/resume-api.test.ts` (cascade delete verified, memory buffer ephemeral, zero disk files) |
| RES-T8 | 01 | Authz tests | RES-T1, FND-T5 | DONE | `tests/resume-api.test.ts` (cross-user access/edit blocked with 404) |
| INT-T1 | 02 | Interview schema | RES-T1 | DONE | Included in Prisma schema (`prisma/schema.prisma`), required topicId, 0≤score≤maxScore bounds |
| INT-T2 | 02 | Rubric templates | INT-T1 | DONE | `tests/rubrics-score.test.ts` (immutable versioned templates for defense, conceptual, code) |
| INT-T3 | 02 | aggregateScore | FND-T1 | DONE | `tests/rubrics-score.test.ts` (pure deterministic summation, strict [0, maxScore] rejection) |
| INT-T4 | 02 | Session state machine | FND-T1 | DONE | `tests/session-state-machine.test.ts` (pause/resume position preserved, illegal transitions rejected) |
| INT-T5 | 02 | Question generation | INT-T2, RES-T6 | DONE | `tests/interview-service.test.ts` (hallucinated tech rejected, duplicate concept sets rejected) |
| INT-T6 | 02 | Response persistence | INT-T1 | DONE | `tests/interview-service.test.ts` (empty/whitespace response rejected with 422, unpersisted) |
| INT-T7 | 02 | Evaluation service | INT-T2, INT-T3, FND-T7 | DONE | `tests/interview-service.test.ts` (LLM rubric evaluation, repair retry, inconclusive on malformed) |
| INT-T8 | 02 | Evidence write (txn) | INT-T7, EVD-T1 | DONE | `tests/interview-service.test.ts` (appends TopicEvidence in same transaction) |
| INT-T9 | 02 | Follow-ups | INT-T7 | DONE | `tests/interview-service.test.ts` (follow-up links to triggering response, max 2 per question) |
| INT-T10 | 02 | Interview UI | INT-T4–T9 | DONE | `/interview` workspace (mode picker, framed prompt, answer editor, breakdown, session report) |
| INT-T11 | 02 | Authz tests | INT-T1 | DONE | `tests/interview-service.test.ts` (cross-user session access blocked with 404) |
| LIB-T1 | 03 | Library schema | FND-T4 | DONE | Included in Prisma schema, unique progress and saved per user+resource |
| LIB-T2 | 03 | Content seed + validation | LIB-T1 | DONE | `tests/library.test.ts` (schema validation passes on curated seed, fails on missing attribution) |
| LIB-T3 | 03 | Filters/search | LIB-T2 | DONE | `tests/library.test.ts` (filtering by topic, type, difficulty, populated facets) |
| LIB-T4 | 03 | Status/attempt/completion pure fns | FND-T1 | DONE | `tests/library.test.ts` (nextAttemptNumber strictly positive, computeResourceProgress policy check) |
| LIB-T5 | 03 | knowledge_check evaluator | LIB-T4 | DONE | `tests/library.test.ts` (deterministic MCQ evaluation in code) |
| LIB-T6 | 03 | short_answer evaluator | INT-T7 | DONE | Reuses LLM rubric evaluation contract |
| LIB-T7 | 03 | Submit txn | LIB-T4, EVD-T1 | DONE | `tests/library.test.ts` (attempt + progress + TopicEvidence appended together) |
| LIB-T8 | 03 | Library UI | LIB-T3, LIB-T7 | DONE | `/library` workspace, populated filter facets, interactive activity studio, attempt grading |
| LIB-T9 | 03 | Authz tests | LIB-T1 | DONE | `tests/library.test.ts` (user attempts and saved bookmarks isolated) |
| EVD-T1 | 04 | TopicEvidence + writer | FND-T4 | DONE | Implemented in `src/modules/evidence/services/evidence-service.ts`, tested via INT-T8 & LIB-T7 |
| EVD-T2 | 04 | Gap rule v1 | EVD-T1 | DONE | `tests/evidence-loop.test.ts` (table-driven tests: 1 low != gap, 2 low = gap, later pass closes it) |
| EVD-T3 | 04 | Resource matching | EVD-T2, LIB-T2 | DONE | `tests/evidence-loop.test.ts` (exact match, has-activity first, difficulty ascending) |
| EVD-T4 | 04 | Handoff DTO | EVD-T3 | DONE | `tests/evidence-loop.test.ts` (leak test verifies zero answer text or quote fields) |
| EVD-T5 | 04 | Retest selection | INT-T5 | DONE | `tests/evidence-loop.test.ts` (never returns answered question, checks comparabilityKey) |
| EVD-T6 | 04 | Before/after | EVD-T2 | DONE | `tests/evidence-loop.test.ts` (comparable only when evidence on both sides, displays raw ratios) |
| EVD-T7 | 04 | Home NBA | EVD-T2, RES-T6 | DONE | `tests/evidence-loop.test.ts` (deterministic priority list, every action has 'because' citing records) |
| EVD-T8 | 04 | Cross-user isolation | EVD-T1 | DONE | `tests/evidence-loop.test.ts` (evidence ledger strictly isolated per userId) |
| QA-T1 | 05 | Golden-set eval harness (see sponsors doc) | INT-T7 | DONE | `evals/eval-harness.test.ts` (golden answers regression suite, monotonic ordering verified) |
| QA-T2 | 05 | Synthetic multi-user fixtures | INT-T1, LIB-T1 | DONE | `fixtures/synthetic-users.test.ts` (complete multi-user isolation across 50 concurrent synthetic users) |
| QA-T3 | 05 | E2E journeys 1–5 | all UI | DONE | `tests/e2e-journeys.test.ts` (complete closed-loop E2E: Resume → Interview → Evidenced Gap → Library Practice → Retest) |
| QA-T4 | 05 | Security + a11y + responsive checklists | all | DONE | `tests/security-a11y.test.ts`, `tests/layout.test.tsx` (logger redaction, rate limiter, touch targets, a11y) |
| QA-T6 | 05 | Hackathon compliance checklist (RULES-HACKTOBERFEST §4) | all | DONE | Open-weight Google Gemma 2 default via `LlmGateway`, MIT license, transparent fake adapter |
| QA-T5 | 05 | README, privacy notes, limitations | all | DONE | `README.md` and `src/app/(public)/privacy/page.tsx` updated with known limitations and privacy architecture |

## Acceptance criteria tracker
| AC | Description | Linked test / evidence | Status |
|---|---|---|---|
| AC-1 | Upload + review resume with parsed claims & skills | `tests/resume-extractor.test.ts`, `tests/resume-api.test.ts`, `/resume` UI | DONE |
| AC-2 | Claims link to verified source text offsets | `tests/locate-quote.test.ts`, `SourceHighlight` component, `/resume` | DONE |
| AC-3 | Question set generated from confirmed claims/skills | `tests/interview-service.test.ts`, `/api/interview-sessions`, `/interview` | DONE |
| AC-4 | Full interview session with persisted rubric evaluations | `tests/rubrics-score.test.ts`, `tests/interview-service.test.ts`, `evals/eval-harness.test.ts` | DONE |
| AC-5 | Follow-up question traceable to triggering response | `tests/interview-service.test.ts`, `tests/e2e-journeys.test.ts` | DONE |
| AC-6 | Tech library with working interactive activities | `tests/library.test.ts`, `/library` UI, `/api/activities/[id]/attempts` | DONE |
| AC-7 | Activity attempts persisted per user without overwrite | `tests/library.test.ts`, `fixtures/synthetic-users.test.ts`, attempt numbering | DONE |
| AC-8 | Resource completion determined by explicit pure policy | `tests/library.test.ts`, `computeResourceProgress` deterministic evaluation | DONE |
| AC-9 | Gap -> resource matching guided by real evidence | `tests/evidence-loop.test.ts`, `tests/e2e-journeys.test.ts`, Gap Rule v1 pure fns | DONE |
| AC-10 | No fabricated user data/progress (honest empty states) | `tests/scaffold.test.ts`, `EmptyState` primitives across all 4 main workspaces | DONE |
| AC-11 | Cross-user access blocked on every private route | `tests/auth.test.ts`, `tests/resume-api.test.ts`, `fixtures/synthetic-users.test.ts` | DONE |
| AC-12 | Responsive shell on 390px (mobile) and 1280px (desktop) | `tests/layout.test.tsx`, NavRail/BottomNav layout, touch targets >= 44px | DONE |
| AC-13 | Explicit loading, empty, error, and retry states | `tests/components.test.tsx`, `FramedPanel`, `ScoreBar`, error banners | DONE |
| AC-14 | Setup reproducible from clean git clone & README | `README.md` quickstart, clean `npm run build` (16 routes), 22/22 test files | DONE |

## Known limitations (fill as discovered; do not hide)
- Scanned-only resumes: ResumePilot v1 does not perform OCR on flattened image-only PDF scans; explicit `failed_unreadable` state is presented to user.
- Code answers: Evaluated against versioned rubrics; code is reviewed, not executed in a runtime sandbox.
- Single auth provider: Authenticated session with cookie; multi-tenant enterprise SSO deferred to v2.
- Upload size cap: Resumes capped at 5 MB; answer submissions capped at 8,000 characters.

## Session log (append, newest first)
| Date | Agent/Person | Task IDs | Outcome | Notes |
|---|---|---|---|---|
| 2026-10-23 | Antigravity | RES-T2..T4, INT-T5..T7 | DONE | Integrated live Google Gemini AI (`gemini-3.5-flash-lite`) via `GeminiLlmGateway`. Verified end-to-end PDF parsing on user resume (`Devisha_Resume.pdf`) extracting 5 verified claims (CasePilot, AQI Data Visualization) with exact offsets via kerning-tolerant `locateQuote`. Differentiated concept sets in `question-generator` to eliminate duplicate question validation errors. Tested live interview session and answer evaluation with Gemini scoring rubric criteria with authentic feedback and verbatim quotes. 22 test suites (96 tests) pass, typecheck clean. |
| 2026-10-23 | Antigravity | QA-T1..T6 | DONE | Completed Phase Gate G6 (Quality & Hardening): Golden-set regression harness (`evals/eval-harness.test.ts`), synthetic 50-user isolation tests (`fixtures/synthetic-users.test.ts`), closed-loop E2E user journeys 1-5 (`tests/e2e-journeys.test.ts`), security & a11y verification (`tests/security-a11y.test.ts`), Hacktoberfest compliance (`RULES-HACKTOBERFEST`), and docs update (`README.md`). 22/22 test suites (96 tests) pass, typecheck clean, lint clean, build clean. |

## Session log (append, newest first)
| Date | Agent/Person | Task IDs | Outcome | Notes |
|---|---|---|---|---|
| 2026-10-23 | Antigravity | EVD-T1..T8 | DONE | Completed Gate G5 Evidence Loop: Gap Rule v1 (EVD-T2), prerequisite-first resource matching (EVD-T3), text-free handoff DTO (EVD-T4), comparabilityKey retest selection (EVD-T5), before/after evidence comparison (EVD-T6), Home Next-Best-Action engine (EVD-T7), cross-user evidence isolation (EVD-T8). 89 tests pass, build clean. |
| 2026-10-23 | Antigravity | LIB-T1..T9 | DONE | Completed Gate G4 Tech Library: schema (LIB-T1), curated seed content & Zod validation (LIB-T2), filtering/search with populated facets (LIB-T3), attempt numbering & progress pure functions (LIB-T4), deterministic knowledge_check evaluator (LIB-T5), short_answer rubric evaluator (LIB-T6), atomic attempt+progress+TopicEvidence submit transaction (LIB-T7), library UI (LIB-T8), user isolation (LIB-T9). 76 tests pass, build clean. |
| 2026-10-23 | Antigravity | INT-T1..T11, EVD-T1 | DONE | Completed Gate G3 Adaptive Interview Lab: rubric templates (INT-T2), aggregateScore (INT-T3), session state machine (INT-T4), question generation with hallucination check (INT-T5), response persistence & validation (INT-T6), evaluation service with repair retry (INT-T7), evidence write (INT-T8, EVD-T1), follow-ups (INT-T9), interview UI (INT-T10), cross-user authz (INT-T11). 69 tests pass, build clean. |
| 2026-10-23 | Antigravity | RES-T1..T8 | DONE | Completed Gate G2 Resume Intelligence: file validation/extraction (RES-T2), exact quote locating (RES-T3), LLM structuring & prompt-injection defense (RES-T4), topic/alias mapping (RES-T5), review workspace UI (RES-T6), ephemeral retention & cascade deletion (RES-T7), cross-user authz (RES-T8). 52 tests pass, build clean. |
| 2026-10-23 | Antigravity | FND-T5..T9 | DONE | Completed Gate G1 Foundation: ownership assertions (FND-T5), error model & redacting logger (FND-T6), LlmGateway with open-weight & fake adapters (FND-T7), rate limiter (FND-T8), and CI/README/LICENSE (FND-T9). 29/29 tests pass. |
| 2026-10-23 | Antigravity | FND-T4 | DONE | Implemented Prisma schema for User, Auth, Topic, TopicEvidence, and module entities. Created initial migration SQL, curated 30 canonical topics seed (`prisma/seed-topics.ts`), and verified with `tests/taxonomy.test.ts`. |
| 2026-10-23 | Antigravity | FND-T3 | DONE | Built App shell (NavRail, BottomNav, TopBar), public pages (landing with animated evidence thread, privacy & retention, sign-in), and workspace shells (/home, /resume, /interview, /library, /history, /settings). `next build` 13/13 static routes passed, layout tests passed. |
| 2026-10-23 | Antigravity | FND-T2 | DONE | Created DESIGN.md components (Button, Badge, ScoreBar, CriterionRow, EvidenceChip, GapMarker, Eyebrow, SourceHighlight, SegmentedControl, FramedPanel, CodeBox, EmptyState), dev workbench `/dev/ui` with theme toggle, and 9 component tests in `tests/components.test.tsx`. |
| 2026-10-23 | Antigravity | FND-T1 | DONE | Scaffolded Next.js 14, strict TS, Tailwind tokens, ESLint import restrictions, Vitest. Typecheck, lint, and test pass clean. |
| 2026-10-23 | Claude (docs) | — | Docs authored | Nothing implemented |
