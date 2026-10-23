# AGENTS.md — Read this first (for Antigravity or any coding agent)

You are building **ResumePilot**. This repo is documentation-driven. Your context WILL be lost between sessions; these files are the memory.

## Start-of-session ritual (mandatory, in order)
1. Read `MEMORY.md` (invariants, decisions, open questions).
2. Read `PROGRESS.md` (what is actually done, with evidence).
3. Pick ONE task from `PROGRESS.md` marked `TODO` whose dependencies are `DONE`.
4. Read only the module file that owns that task (`modules/0X-*.md`), plus `ARCHITECTURE.md` sections it cites.
5. State the task ID and your plan before writing code.

## End-of-session ritual (mandatory)
1. Run tests/typecheck. Paste the real command + result summary into `PROGRESS.md` as evidence.
2. Mark a task `DONE` only if its acceptance criteria (listed in the module file) pass. Otherwise `PARTIAL` + say what is missing.
3. Append new decisions to `MEMORY.md` (Decision Log). Append unresolved questions to Open Questions.
4. Never edit `PRD.md` / `blueprint.md` silently. Propose changes in `MEMORY.md` → Proposed Changes.

## Anti-hallucination rules
- If a file, library, API, or version is not in the repo or these docs, **verify it** (read the code / package docs) before using it. Do not guess signatures.
- Never mark something done that you did not run.
- Never seed fake user data, fake scores, fake progress. Synthetic data is allowed ONLY in `tests/` and `fixtures/`, labelled synthetic (see `sponsors/INTEGRATIONS.md`).
- Do not add dependencies, databases, queues, or services not listed in `ARCHITECTURE.md` without a Decision Log entry.
- If a requirement can't be met in the current environment, document it in `PROGRESS.md → Known Limitations` instead of faking it.

## Document map
| File | Purpose |
|---|---|
| `blueprint.md` | Vision, the connecting spine, user flows, scope cuts |
| `PRD.md` | Requirements with IDs, acceptance, metrics |
| `ARCHITECTURE.md` | Stack, boundaries, ERD, state machines, security |
| `DESIGN.md` | Minimal design system |
| `modules/00..05` | Per-module spec, tasks, acceptance criteria |
| `PROGRESS.md` | Live task board with evidence |
| `MEMORY.md` | Invariants, decisions, glossary, open questions |
| `sponsors/INTEGRATIONS.md` | Which sponsor tools we use, and why/why not |
| `RULES-HACKTOBERFEST.md` | Hackathon compliance rules — hard constraints, read before submission work |

> Antigravity note: confirm where your Antigravity version reads project rules/workflows from (not verified here) and point it at this file.
