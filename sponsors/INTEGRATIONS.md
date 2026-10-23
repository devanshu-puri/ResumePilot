# Sponsor integrations — what fits, what doesn't

I read the README of **agentic-evals**, **DeepAgent MCP server** and **great-generator**. The other DeepAgentLabs repos are covered by what those READMEs say about them; I did not open them individually. Everything below is limited to what those READMEs state.

## Honest fit summary
| Sponsor repo | Use? | Where | Why |
|---|---|---|---|
| **agentic-evals** | **Yes — dev/CI** | `QA-T1` | Python engine for scoring outputs, with release gates. Fits our need to prove rubric evaluators are stable. Judge failures become an explicit *unavailable* score that never passes — same philosophy as our `inconclusive` state. |
| **great-generator** | **Yes — tests only** | `QA-T2` | Generates synthetic tables with valid PK/FK from a schema. Perfect for multi-user isolation tests, progress-calculation tests, and volume checks. Not for resume prose. |
| **DeepAgent MCP server** | Optional | later | Exposes Evals-report validation and a fail-closed release check over MCP. Its default release check expects Lens + Evals + Chaos evidence; narrowing is possible (`required_evidence`), but verify tool names in its `docs/tools.md` before depending on it. |
| ai-operations-spec, AgenticLens, Agentic Chaos, Agentic Sidecar, Control Tower | **No** | — | They target observing, fault-injecting, or supervising deployed agent workflows. ResumePilot is a web app calling an LLM through a gateway, not an agent fleet. Forcing them in would add Python services with no user benefit and would violate "no unnecessary layers". Revisit only if we ship autonomous agent workflows. |

Starring the repos (the hackathon track action) must be done by you from your GitHub account; I can't do it.

## 1. agentic-evals → golden-set regression for evaluators (QA-T1)
**Goal:** detect when a prompt/model/rubric change makes scoring drift.

Layout (isolated Python tooling; not part of the Next.js bundle):
```
evals/
  pyproject.toml           # pip install agentic-evals
  golden/                  # hand-written, clearly synthetic answers + expected ratio band
    conceptual_redis_cache.yaml
  export-samples.ts        # runs OUR evaluator over golden answers → samples.jsonl
  suite.yaml               # agentic-evals declarative suite
  gate.yaml                # thresholds
```
Flow: `tsx evals/export-samples.ts > samples.jsonl` → `agentic-evals evaluate evals/suite.yaml samples.jsonl --out report.json` → `agentic-evals gate report.json --config evals/gate.yaml` (exit 0 pass, 1 gate fail, 2 usage error — per its README).

What to check (deterministic, no second LLM judge needed at first):
- output is valid JSON matching our schema (`valid_json`, JSON-Schema expectation)
- total ratio within the expected band for each golden answer (`numeric_range`)
- weak/strong ordering: strong answer ratio > weak answer ratio
- inconclusive rate under threshold
Use `tags` (`conceptual`, `defense`, `code_review`) and a gate with `min_tag_pass_rate` per tag. Pin the package version (README says the API may move before 1.0).
Optional later: `samples=N` judge agreement if we add an LLM-judge for explanation quality.
**Verify before coding:** exact scorer names and YAML suite schema from the package docs (`docs/cli.md`, `docs/report-contract.md` in that repo).

## 2. great-generator → synthetic multi-user fixtures (QA-T2)
**Goal:** large, relational, *labelled-synthetic* datasets for tests.
```
fixtures/
  gen.py        # pip install great-generator ; generate_relational(...) with users, attempts, evidence
  out/*.csv     # gitignored or small checked-in sample
  load.ts       # loads into the TEST database only
```
Use for: (a) 200 users × random attempts to prove no cross-user leakage in list endpoints; (b) evidence volume for gap-rule performance; (c) pagination. Set `seed` for reproducibility. Guard: `load.ts` refuses to run unless `NODE_ENV=test` and DB name ends in `_test`. Great Generator creates fake data and does not anonymise production data — we never feed it production records.
Resume text fixtures stay hand-written (3–5 clearly fake resumes incl. a scanned-like and an injection case).

## 3. DeepAgent MCP server (optional, post-MVP)
If Antigravity supports MCP servers (verify), connect it for local use only (README: local stdio is the trusted mode; hosted mode disables code execution). Possible use: validate our Evals `report.json` via `evals.validate_artifact` as a pre-merge check. Not required for any acceptance criterion.

## Demo/hackathon story
"ResumePilot's scoring is regression-tested with agentic-evals, and its isolation/progress logic is tested against large synthetic datasets from great-generator" — both claims will be true only after QA-T1/QA-T2 are DONE with evidence in `PROGRESS.md`. Don't present it before.
