# Module 05 — Quality & Hardening

**Purpose:** prove it works, is safe, and is honest. **Depends on:** all. Run incrementally, not only at the end.

## Test layers
- **Unit (Vitest):** all `domain/` functions (aggregation, gap rule, transitions, quote location, completion).
- **Integration:** route handlers + real Postgres (test container) + fake LLM gateway.
- **E2E (Playwright):** journeys 1–5 from the original spec; viewports 390×844 and 1280×800.
- **Eval regression:** golden set for rubric evaluators (see `sponsors/INTEGRATIONS.md`); run in CI, advisory first then gating.

## Security checklist (tick in PROGRESS with evidence)
Upload limits & magic bytes · no file persisted · injection fixtures pass · every repository method takes `userId` · cross-user tests for every private route · no content in logs (grep test) · rate limits on upload/evaluate/generate · CSP and security headers · secrets only via env · delete-my-data works and is tested · export-my-data works.

## Responsive/a11y checklist
No horizontal overflow at 320 px · touch targets ≥44 px · keyboard-only run through journeys 1–3 · axe has zero serious/critical issues on main screens · live region on evaluation completion · reduced-motion respected.

## State coverage matrix
Each workflow × {empty, loading, error+retry, inconclusive/failed, offline}. A screenshot or test name per cell in PROGRESS.

## Docs to finish
README (setup, env, migrations, running tests) · privacy & retention notes · Known Limitations (no OCR, no code execution, single auth provider, content size) · ADRs.

## Acceptance
All AC-1…AC-14 from `PRD.md §8` have a linked test or documented limitation.
