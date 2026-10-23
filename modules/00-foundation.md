# Module 00 — Foundation

**Purpose:** everything the other modules stand on. **Depends on:** nothing. **Blocks:** all.

## Scope
Repo scaffold · design system primitives · app shell · DB + migrations · auth + ownership helpers · error model · logging · LLM gateway · env handling · CI.

## Tasks
| ID | Task | Acceptance |
|---|---|---|
| FND-T1 | Scaffold Next.js + TS strict + Tailwind; lint, format, typecheck scripts | typecheck and lint pass in CI |
| FND-T2 | Tokens + base components from `DESIGN.md` | Dev-only page `/dev/ui` renders all variants in light and dark |
| FND-T3 | App shell (rail / bottom tabs), public pages (landing, privacy, sign-in) | Playwright: nav works at 390 px and 1280 px, no horizontal scroll |
| FND-T4 | Prisma schema for Topic, User, auth tables + first migration | Migration runs clean on an empty DB; README steps reproducible |
| FND-T5 | Auth (single provider) + `requireUser()` + repository convention (`userId` mandatory) | Unauthenticated → 401; user A cannot read user B record (generic helper test) |
| FND-T6 | Error model (`AppError` codes → safe responses), redacting logger | Internal error never leaks message/stack; logger rejects fields named `text`, `answer`, `resume` |
| FND-T7 | `LlmGateway` interface + fake implementation + env-selected real provider | Contract test against the fake; real provider optional behind env |
| FND-T8 | Rate-limit utility (per user + route) | Unit test of window logic |
| FND-T9 | `.env.example` (placeholders only), README setup, CI workflow | Fresh clone + documented commands → app boots |

## Out of scope
Any module-specific entity. Don't create empty module folders.

## Notes
Seed script for the **Topic taxonomy only** (real curated topics, ~30 to start). That is product content, not fake user data.
