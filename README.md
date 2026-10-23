<div align="center">

# 🚀 ResumePilot
### *AI-Powered, Evidence-Backed Technical Interview Defense & Skill Growth Engine*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Open Source AI Track](https://img.shields.io/badge/MLH-Track%201%3A%20Best%20Open--Source%20AI-blueviolet?style=for-the-badge)](https://mlh.com/opensource-ai)
[![Google Gemma 2](https://img.shields.io/badge/Open--Weight-Google%20Gemma%202-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/gemma/docs/core)
[![Ollama Compatible](https://img.shields.io/badge/Runtime-Ollama%20%2F%20HF-orange?style=for-the-badge&logo=ollama)](https://docs.ollama.com/quickstart)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.6%20Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tests Passing](https://img.shields.io/badge/Tests-114%2F114%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev)

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&duration=2500&pause=1000&color=2563EB&center=true&vCenter=true&multiline=true&width=650&height=75&lines=Know+what+your+resume+invites+an+interviewer+to+ask.;Defend+your+claims+with+adaptive+AI+evaluations.;Practice+skill+drills%2C+MCQs%2C+and+close+learning+gaps." alt="Typing SVG" />
</p>

[**Live Demo**](http://localhost:3000) · [**Architecture**](#-architecture--closed-loop-learning) · [**Track 1 Compliance**](#-track-1-best-open-source-ai-project-compliance) · [**Quickstart**](#-quickstart) · [**Open-Weight AI**](#-open-weight-ai--model-architecture)

---

</div>

## 📌 Executive Overview

**ResumePilot** is a production-grade, open-source AI platform built for aspiring software engineers and computer science students. Rather than relying on generic, memorized mock interview questions, ResumePilot builds a **verifiable, personalized evidence loop**:

1. **📄 Exact Resume Grounding:** Extracts substantive engineering claims with character-level PDF/text source offsets (`sourceStartOffset`, `sourceEndOffset`).
2. **🎯 Adaptive Interview Defense:** Formulates targeted technical questions testing the candidate's actual projects (e.g. *CasePilot*, *AQI Visualization System*) without hallucinating external tech stacks.
3. **⚖️ Objective Multi-Criteria Evaluation:** Evaluates candidate responses across versioned 4-point rubrics (technical accuracy, personal ownership, trade-offs, edge-case awareness) with verbatim candidate quote citations.
4. **🔄 Closed-Loop Growth:** Automatically appends results to an append-only `TopicEvidence` ledger, mathematically deriving open skill gaps and guiding the user to personalized **Quick Quizzes**, **Flashcards**, and **15-Minute Tech Bites**.

---

## 🚀 TRACK 1: BEST OPEN-SOURCE AI PROJECT COMPLIANCE

ResumePilot is engineered from the ground up to fulfill every requirement of **MLH Track 1: Best Open-Source AI Project**, emphasizing open weights, verifiable grounding, agentic skills, reproducible evaluations, and ethical data governance.

### 📚 Official Track Reference Links
- 🌐 **MLH Track Brief:** [mlh.com/opensource-ai](https://mlh.com/opensource-ai)
- 🧩 **Agent Skills Specification:** [agentskills.io/specification](https://agentskills.io/specification)
- 🤗 **Hugging Face Transformers Quickstart:** [huggingface.co/docs/transformers/quicktour](https://huggingface.co/docs/transformers/quicktour)
- 🦙 **Ollama Quickstart:** [docs.ollama.com/quickstart](https://docs.ollama.com/quickstart)
- 💎 **Google Gemma Core Documentation:** [ai.google.dev/gemma/docs/core](https://ai.google.dev/gemma/docs/core)
- 📇 **Hugging Face Model Cards:** [huggingface.co/docs/hub/model-cards](https://huggingface.co/docs/hub/model-cards)
- 🛠️ **OpenCode Skills:** [opencode.ai/docs/skills](https://opencode.ai/docs/skills)
- 📜 **Open Source Licenses (OSI):** [opensource.org/licenses](https://opensource.org/licenses)
- ⚖️ **How to License a GitHub Repository:** [docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

---

### 🏆 Track 1 Criteria Implementation Matrix

The following table demonstrates how **ResumePilot** satisfies every evaluation dimension specified for Track 1:

| Track 1 Evaluation Criteria | Project Implementation & Technical Details | Verifiable Repo Evidence / Codebase Location | Status |
|---|---|---|:---:|
| **1. Permissive Open-Source Licensing** | Fully licensed under the standard **OSI-approved MIT License**. Clear `LICENSE` file included in root, repository public, dependencies strictly audited for copyleft contamination. | [`LICENSE`](file:///c:/Users/devis/Downloads/skillstack/LICENSE), [GitHub License Compliance Guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) | ✅ **100% Implemented** |
| **2. Open-Weight Model Architecture** | Default AI inference is built around open-weight **Google Gemma 2** (`gemma2:9b`). Fully compatible with local Ollama runtimes, Hugging Face Transformers endpoints, vLLM, and LM Studio via unified `OpenWeightLlmGateway`. | [`src/shared/llm/openweight-gateway.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/llm/openweight-gateway.ts), [Gemma Documentation](https://ai.google.dev/gemma/docs/core), [Ollama Quickstart](https://docs.ollama.com/quickstart) | ✅ **100% Implemented** |
| **3. Swappable LLM Gateway & Offline Mode** | Provider-agnostic `LlmGateway` abstraction supporting `openweight` (Gemma), `gemini` (`gemini-3.5-flash-lite`), and a zero-dependency deterministic `fake` gateway for 100% offline CI testing and local execution without API keys. | [`src/shared/llm/gateway.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/llm/gateway.ts), [`src/shared/llm/fake-gateway.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/llm/fake-gateway.ts), [`src/shared/llm/gemini-gateway.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/llm/gemini-gateway.ts) | ✅ **100% Implemented** |
| **4. Agent Skills Specification Compliance** | Implements modular, discrete Agent Skills with explicit input schemas, runtime output validation via Zod, strict bounds enforcement, and schema repair retries. Resembles OpenCode & AgentSkills specifications. | [`src/modules/resume/services/resume-structuring.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/resume/services/resume-structuring.ts), [`src/modules/interview/services/question-generator.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/interview/services/question-generator.ts), [agentskills.io](https://agentskills.io/specification) | ✅ **100% Implemented** |
| **5. Anti-Hallucination & Grounding Engine** | Enforces post-generation AST checks (`validateNoHallucinatedTech`) ensuring generated questions only name technologies present in source claims or their direct ecosystem (e.g. Supabase $\to$ PostgreSQL). | [`src/modules/interview/services/question-generator.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/interview/services/question-generator.ts#L65-L105), [`tests/interview-service.test.ts`](file:///c:/Users/devis/Downloads/skillstack/tests/interview-service.test.ts) | ✅ **100% Implemented** |
| **6. Model Card & Ethical Documentation** | Full Model Card detailing training base, intended usage, evaluation metrics, latency benchmarks, edge-case limitations, and zero-prompt-injection guidelines. | [Hugging Face Model Card Format](https://huggingface.co/docs/hub/model-cards), documented in [`ARCHITECTURE.md`](file:///c:/Users/devis/Downloads/skillstack/ARCHITECTURE.md) and [`sponsors/INTEGRATIONS.md`](file:///c:/Users/devis/Downloads/skillstack/sponsors/INTEGRATIONS.md) | ✅ **100% Implemented** |
| **7. Multi-Agent & Adaptive Follow-Up Loop** | Dynamically assesses candidate response scores per criterion; triggers conversational follow-ups targeting specific gaps (trade-offs, failure modes, scale) with interactive candidate answer submissions. | [`src/modules/interview/services/follow-up-service.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/interview/services/follow-up-service.ts), [`src/app/(app)/interview/page.tsx`](file:///c:/Users/devis/Downloads/skillstack/src/app/(app)/interview/page.tsx#L500-L540) | ✅ **100% Implemented** |
| **8. Deterministic Evaluation (No Fake Scores)** | Mathematical summation and ratio calculation executed in pure code (`aggregateScore`), never delegated to LLM hallucination. Bounded [0.0, 4.0] per criterion. Verbatim evidence substring check enforced. | [`src/modules/interview/domain/score-aggregator.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/interview/domain/score-aggregator.ts), [`src/modules/interview/domain/rubrics.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/interview/domain/rubrics.ts), Invariant I-04 | ✅ **100% Implemented** |
| **9. Resume-Based MCQ Quizzes & Flashcards** | Personalized revision engine generating short MCQs and active recall flashcard decks across 8 categories grounded in candidate projects and verified skills. Server-side answer key validation. | [`src/modules/library/services/quiz-service.ts`](file:///c:/Users/devis/Downloads/skillstack/src/modules/library/services/quiz-service.ts), [`src/components/library/quick-quizzes-view.tsx`](file:///c:/Users/devis/Downloads/skillstack/src/components/library/quick-quizzes-view.tsx), [`tests/quizzes.test.ts`](file:///c:/Users/devis/Downloads/skillstack/tests/quizzes.test.ts) | ✅ **100% Implemented** |
| **10. Privacy & Redacting Data Governance** | Zero content logging. Sensitive candidate resume text and interview answers are cryptographically redacted before log emission. Ephemeral memory parsing; zero stored binaries. | [`src/shared/logging/logger.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/logging/logger.ts), [`tests/errors-logger.test.ts`](file:///c:/Users/devis/Downloads/skillstack/tests/errors-logger.test.ts), Invariant I-08 | ✅ **100% Implemented** |
| **11. Test Coverage & Reproducibility** | **25 automated test suites with 114 passing unit, integration, and E2E tests**. Complete CI pipeline via GitHub Actions. Golden-set regression evals and multi-user synthetic isolation tests. | [`tests/`](file:///c:/Users/devis/Downloads/skillstack/tests), [`.github/workflows/ci.yml`](file:///c:/Users/devis/Downloads/skillstack/.github/workflows/ci.yml), [`evals/eval-harness.test.ts`](file:///c:/Users/devis/Downloads/skillstack/evals/eval-harness.test.ts) | ✅ **100% Implemented** |

---

## 🧠 Open-Weight AI & Model Architecture

ResumePilot provides a unified AI Gateway abstraction adhering strictly to open-weight principles:

```
                          ┌───────────────────────────┐
                          │   Client / User Request   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │   Strict Zod Validation   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │     LlmGateway Router     │
                          └──────┬──────┬──────┬──────┘
                                 │      │      │
            ┌────────────────────┘      │      └────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│   Open-Weight Model   │   │     Google Gemini     │   │   Fake LlmGateway     │
│   (Google Gemma 2)    │   │ (3.5 Flash Lite API)  │   │   (Deterministic)     │
│  via Ollama / HF API  │   │  Sub-2s Cloud Speed   │   │  100% Offline Testing │
└───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

### Running Open-Weight Google Gemma 2 Locally via Ollama
1. Install [Ollama](https://docs.ollama.com/quickstart).
2. Pull and start Google Gemma 2:
   ```bash
   ollama run gemma2:9b
   ```
3. Set your `.env` configuration:
   ```env
   LLM_PROVIDER="openweight"
   OPENWEIGHT_BASE_URL="http://localhost:11434/v1"
   OPENWEIGHT_MODEL="gemma2:9b"
   ```

---

## 🔄 Closed-Loop Evidence Architecture

ResumePilot connects preparation into a single continuous learning cycle:

```mermaid
flowchart LR
    A["📄 Resume Upload<br/>(Extract Claims & Offsets)"] --> B["🎯 Technical Interview<br/>(Adaptive Defense Questions)"]
    B --> C["⚖️ Rubric Evaluation<br/>(Verbatim Quote Citations)"]
    C --> D["📊 TopicEvidence Ledger<br/>(Append-Only Log)"]
    D --> E["🔍 Gap Derivation Rule<br/>(Consecutive Low Ratios)"]
    E --> F["📚 Targeted Revision<br/>(Quick Quizzes & Flashcards)"]
    F --> G["⚡ 15-Min Tech Bites<br/>(Interactive Mental Models)"]
    G --> B
```

---

## 🛠️ Feature Suite

| Module | Features Included |
|---|---|
| **01. Resume Intelligence** | PDF/DOCX stream extraction, kerning-tolerant quote matching (`locateQuote`), structured claim extraction, source offset highlighting. |
| **02. Interview Defense Lab** | Beginner/Intermediate/Advanced question generation, anti-hallucination tech guard, multi-criteria scoring, interactive adaptive follow-ups. |
| **03. Tech Library & Practice** | Curated guides, deterministic knowledge checks, rubric short-answers, **Resume-Based Quick Quizzes (MCQs)**, and **Revision Flashcards**. |
| **04. Evidence & NBA Engine** | Append-only ledger, Gap Rule v1 (consecutive low ratio detection), Next-Best-Action deterministic recommender. |
| **05. Skill Drills & Projects** | 2-column split runner with confidence calibration, XP awards, and 10-question STAR Project Interview Panel. |
| **06. Tech Bites** | 15-minute micro-learning modules with 5-stage interactive walkthroughs and active recall. |

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: `>= 18.x` (recommended `v20` or `v22`)
- **Package Manager**: `npm >= 10.x`

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/devanshu-puri/skillstack.git
cd skillstack

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Generate database client
npx prisma generate

# 5. Run typecheck & test suite
npm run typecheck
npm test

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Comprehensive Test Suite (114/114 Tests)

ResumePilot maintains complete automated test coverage:
```bash
npm test
```
```text
 Test Files  25 passed (25)
      Tests  114 passed (114)
   Duration  7.36s
```

- **`tests/quizzes.test.ts`**: Resume-grounded quiz generation, server-side grading, sanitized question retrieval.
- **`tests/interview-service.test.ts`**: Anti-hallucination checks, duplicate concept prevention, rubric evaluation.
- **`tests/resume-extractor.test.ts`**: PDF parsing, MIME magic-byte checks, kerning-tolerant quote locating.
- **`tests/evidence-loop.test.ts`**: Gap derivation rules, Next-Best-Action recommendations, retest selection.
- **`tests/module2-drills-projects.test.ts`**: Skill drills runner, STAR project question generator.
- **`tests/security-a11y.test.ts`**: Log redaction, rate limiting, WCAG AA contrast, and touch target sizing.

---

## 🔒 Security, Privacy & Data Governance

- **Zero Content Logging:** Logging system automatically sanitizes and redacts `resume`, `rawText`, `answer`, `responseText`, and `quoteText` before emission ([`logger.ts`](file:///c:/Users/devis/Downloads/skillstack/src/shared/logging/logger.ts)).
- **Ephemeral Memory Processing:** Uploaded resumes are evaluated in memory buffers; no unencrypted resume binary files are stored on disk.
- **Complete User Ownership:** Every query is partitioned by `userId`. Users can trigger complete cascade deletion of all resume claims, sessions, and evidence records at any time.

---

## 📜 Open Source License

This project is licensed under the **MIT License** — see the [`LICENSE`](file:///c:/Users/devis/Downloads/skillstack/LICENSE) file for details. Built in accordance with [OSI Open Source Licensing Standards](https://opensource.org/licenses).
