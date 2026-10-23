# PROGRESS — live task board (source of truth for "what is done")

**Rules:** Status ∈ `TODO | IN_PROGRESS | PARTIAL | DONE | BLOCKED`. `DONE` requires the Evidence cell to hold a real command/test name + result. Empty Evidence ⇒ not done. Agents update this file at the end of every session.

**Last updated:** 2026-10-23 (Gate G2 complete: RES-T1..T8 DONE)
**Current focus:** INT-T1
**Repo state:** Gates G1 and G2 complete (52/52 tests pass, Next.js build passes 14/14 routes)

## Phase gates
| Gate | Condition | Status |
|---|---|---|
| G1 Foundation | FND-T1…T9 DONE | DONE |
| G2 Resume | RES-T1…T8 DONE | DONE |
| G3 Interview | INT-T1…T11 DONE | TODO |
| G4 Library | LIB-T1…T9 DONE | TODO |
| G5 Loop | EVD-T1…T8 DONE | TODO |
| G6 Hardening | Module 05 checklists ticked, AC-1…AC-14 linked | TODO |

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
| INT-T1 | 02 | Interview schema | RES-T1 | TODO | |
| INT-T2 | 02 | Rubric templates | INT-T1 | TODO | |
| INT-T3 | 02 | aggregateScore | FND-T1 | TODO | |
| INT-T4 | 02 | Session state machine | FND-T1 | TODO | |
| INT-T5 | 02 | Question generation | INT-T2, RES-T6 | TODO | |
| INT-T6 | 02 | Response persistence | INT-T1 | TODO | |
| INT-T7 | 02 | Evaluation service | INT-T2, INT-T3, FND-T7 | TODO | |
| INT-T8 | 02 | Evidence write (txn) | INT-T7, EVD-T1 | TODO | |
| INT-T9 | 02 | Follow-ups | INT-T7 | TODO | |
| INT-T10 | 02 | Interview UI | INT-T4–T9 | TODO | |
| INT-T11 | 02 | Authz tests | INT-T1 | TODO | |
| LIB-T1 | 03 | Library schema | FND-T4 | TODO | |
| LIB-T2 | 03 | Content seed + validation | LIB-T1 | TODO | |
| LIB-T3 | 03 | Filters/search | LIB-T2 | TODO | |
| LIB-T4 | 03 | Status/attempt/completion pure fns | FND-T1 | TODO | |
| LIB-T5 | 03 | knowledge_check evaluator | LIB-T4 | TODO | |
| LIB-T6 | 03 | short_answer evaluator | INT-T7 | TODO | |
| LIB-T7 | 03 | Submit txn | LIB-T4, EVD-T1 | TODO | |
| LIB-T8 | 03 | Library UI | LIB-T3, LIB-T7 | TODO | |
| LIB-T9 | 03 | Authz tests | LIB-T1 | TODO | |
| EVD-T1 | 04 | TopicEvidence + writer | FND-T4 | TODO | |
| EVD-T2 | 04 | Gap rule v1 | EVD-T1 | TODO | |
| EVD-T3 | 04 | Resource matching | EVD-T2, LIB-T2 | TODO | |
| EVD-T4 | 04 | Handoff DTO | EVD-T3 | TODO | |
| EVD-T5 | 04 | Retest selection | INT-T5 | TODO | |
| EVD-T6 | 04 | Before/after | EVD-T2 | TODO | |
| EVD-T7 | 04 | Home NBA | EVD-T2, RES-T6 | TODO | |
| EVD-T8 | 04 | Cross-user isolation | EVD-T1 | TODO | |
| QA-T1 | 05 | Golden-set eval harness (see sponsors doc) | INT-T7 | TODO | |
| QA-T2 | 05 | Synthetic multi-user fixtures | INT-T1, LIB-T1 | TODO | |
| QA-T3 | 05 | E2E journeys 1–5 | all UI | TODO | |
| QA-T4 | 05 | Security + a11y + responsive checklists | all | TODO | |
| QA-T6 | 05 | Hackathon compliance checklist (RULES-HACKTOBERFEST §4) | all | TODO | |
| QA-T5 | 05 | README, privacy notes, limitations | all | TODO | |

## Acceptance criteria tracker
| AC | Linked test / evidence | Status |
|---|---|---|
| AC-1 … AC-14 (PRD §8) | | TODO |

## Known limitations (fill as discovered; do not hide)
- (planned) No OCR for scanned resumes → explicit unreadable state.
- (planned) No code execution; code answers are reviewed only.
- (planned) Single auth provider.

## Session log (append, newest first)
| Date | Agent/Person | Task IDs | Outcome | Notes |
|---|---|---|---|---|
| 2026-10-23 | Antigravity | RES-T1..T8 | DONE | Completed Gate G2 Resume Intelligence: file validation/extraction (RES-T2), exact quote locating (RES-T3), LLM structuring & prompt-injection defense (RES-T4), topic/alias mapping (RES-T5), review workspace UI (RES-T6), ephemeral retention & cascade deletion (RES-T7), cross-user authz (RES-T8). 52 tests pass, build clean. |
| 2026-10-23 | Antigravity | FND-T5..T9 | DONE | Completed Gate G1 Foundation: ownership assertions (FND-T5), error model & redacting logger (FND-T6), LlmGateway with open-weight & fake adapters (FND-T7), rate limiter (FND-T8), and CI/README/LICENSE (FND-T9). 29/29 tests pass. |
| 2026-10-23 | Antigravity | FND-T4 | DONE | Implemented Prisma schema for User, Auth, Topic, TopicEvidence, and module entities. Created initial migration SQL, curated 30 canonical topics seed (`prisma/seed-topics.ts`), and verified with `tests/taxonomy.test.ts`. |
| 2026-10-23 | Antigravity | FND-T3 | DONE | Built App shell (NavRail, BottomNav, TopBar), public pages (landing with animated evidence thread, privacy & retention, sign-in), and workspace shells (/home, /resume, /interview, /library, /history, /settings). `next build` 13/13 static routes passed, layout tests passed. |
| 2026-10-23 | Antigravity | FND-T2 | DONE | Created DESIGN.md components (Button, Badge, ScoreBar, CriterionRow, EvidenceChip, GapMarker, Eyebrow, SourceHighlight, SegmentedControl, FramedPanel, CodeBox, EmptyState), dev workbench `/dev/ui` with theme toggle, and 9 component tests in `tests/components.test.tsx`. |
| 2026-10-23 | Antigravity | FND-T1 | DONE | Scaffolded Next.js 14, strict TS, Tailwind tokens, ESLint import restrictions, Vitest. Typecheck, lint, and test pass clean. |
| 2026-10-23 | Claude (docs) | — | Docs authored | Nothing implemented |
