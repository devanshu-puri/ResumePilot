# ResumePilot

> **Know what your resume invites an interviewer to ask. Practise defending it. Fix what you can't yet explain.**

ResumePilot is an evidence-backed technical interview preparation system built for CS students and early-career developers. Unlike generic mock interview tools, ResumePilot:
1. **Extracts verifiable claims** from your uploaded resume, computing exact character source offsets.
2. **Generates targeted interview defense questions** grounded directly in your source claims without hallucinating outside facts.
3. **Evaluates responses deterministically and via versioned rubrics** with criterion-level breakdowns (never invented scores).
4. **Appends observations to an append-only `TopicEvidence` ledger**, deriving actionable skill gaps that connect directly to curated learning modules and comparable retests.

---

## Architecture & Layering

ResumePilot is architected as a modular monolith following strict boundary rules:
- **`src/app`**: Next.js App Router UI pages, layouts, and route handlers.
- **`src/modules/{resume,interview,library,evidence}`**:
  - `domain/`: Pure deterministic domain logic (gap rules, attempt numbering, score aggregation).
  - `services/`: Business transactions, evaluations, and orchestration.
  - `repositories/`: Database queries scoped strictly by `userId` (Invariant I-07).
- **`src/shared/`**:
  - `auth/`: Ownership assertions and authentication checks.
  - `database/`: Prisma client singleton.
  - `errors/`: Typed operational `AppError` handling with safe external responses.
  - `logging/`: Strict redacting logger rejecting user resume and answer content (Invariant I-08).
  - `llm/`: `LlmGateway` abstraction with open-weight model defaults and fake adapters for offline/test environments.
  - `security/`: Per-user sliding-window rate limiting.

---

## Open-Weight AI Architecture (Hacktoberfest 2026 Compliance)

ResumePilot strictly adheres to the open-source and open-weight AI guidelines:
- **Default Inference Model**: Open-weight [Google Gemma 2](https://ai.google.dev/gemma) (`gemma2:9b`).
- **Inference Runtime**: Standard OpenAI-compatible local/hosted open-weight endpoint (e.g. Ollama, vLLM, LM Studio).
- **Offline / Test Mode**: Ships with a fully deterministic `FakeLlmGateway` allowing 100% offline development and reproducible unit testing without API keys.

---

## Sponsor Integrations

- **agentic-evals**: Evaluator regression harness against golden answer sets (`QA-T1`).
- **great-generator**: Synthetic multi-user relational datasets for isolation and stress testing (`QA-T2`).

---

## Quickstart

### Prerequisites
- Node.js >= 18.x (tested on Node v20/v24)
- npm >= 10.x

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Generate Prisma client
npx prisma generate

# 4. Run typecheck & linter
npm run typecheck
npm run lint

# 5. Run test suite
npm run test

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application, or [http://localhost:3000/dev/ui](http://localhost:3000/dev/ui) to view the design system workbench.

---

## Verification & Tests

```bash
# Run all automated unit and integration tests
npm test

# Run Next.js production build verification
npm run build
```

---

## Known Limitations (QA-T5)

- **Scanned Resumes**: ResumePilot v1 does not perform OCR on flattened image-only PDF scans; resumes without extractable text transition to an explicit `failed_unreadable` state prompting the candidate to upload a text-based document.
- **Code Answers**: Candidate code explanations and snippets are evaluated against versioned rubrics for correctness, structure, and trade-offs. Code is strictly *reviewed, not executed* in a sandbox (eliminating remote code execution risks).
- **Authentication**: Single auth provider with session cookie; multi-tenant enterprise SSO is deferred to v2.
- **Payload Limits**: Uploads capped at 5 MB; answer submissions capped at 8,000 characters.

---

## Privacy & Data Governance (ACC-1, RES-7, Invariant I-08)

- **Zero Content Logging**: All application logging passes through `src/shared/logging/logger.ts`, which automatically and recursively redacts `resume`, `rawText`, `answer`, `responseText`, and `quoteText` before emission.
- **Ephemeral Processing**: Resumes are parsed in-memory from ephemeral memory buffers; no raw resume binary files are saved to the server disk.
- **Complete User Ownership**: Candidate records are strictly partitioned by `userId`. Users can trigger complete cascade deletion of their resume, questions, responses, and evidence ledger at any time.

---

## License

MIT License. See `LICENSE` for details.
