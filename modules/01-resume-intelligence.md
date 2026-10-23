# Module 01 — Resume Intelligence

**Purpose:** turn a resume into traceable, user-confirmed claims and topics. **Depends on:** 00. **Feeds:** 02 (question context), 04 (topic links).

## Entities
Resume, ResumeSection, ResumeProject, ResumeClaim, ResumeTopic (replaces Skill/ResumeSkill). See `ARCHITECTURE.md §3`.

## Pipeline (ARCHITECTURE §6)
validate → extract → readability heuristic → LLM structuring (resume as untrusted data) → Zod → **app computes offsets from exact quotes** → topic mapping → persist unconfirmed → user review → confirmed.

## API
- `POST /api/resumes` (multipart or `{text}`) → `{resumeId, status}`
- `GET /api/resumes/:id` → resume + sections + claims + topics (owner only)
- `PATCH /api/resumes/:id/claims/:claimId` → `{claimText?, claimType?, userConfirmed?, excluded?}`
- `DELETE /api/resumes/:id` → cascade
- `POST /api/resumes/:id/question-sets` → delegates to Module 02 service; selected claim/topic ids must belong to this resume and be confirmed

## UI
Upload → processing → review workspace (text | claim detail), topics panel, project cards, target-role selector, "Create question set" (disabled until ≥1 confirmed claim, with the reason shown).

## States
no resume · uploading · extracting · failed_unreadable (explain scanned/image PDF; offer paste-text) · failed_error (retry) · review_pending · confirmed · LLM unavailable (show unavailable + retry; never fake extraction).

## Rules
- Skills-list items create `ResumeTopic` only; they never create `technology_used` / `project_implementation` claims.
- Count of discarded suggestions is shown to the user.
- Edited claims keep original quote + offsets; `claimText` is the interpretation.

## Tasks & acceptance
| ID | Task | Acceptance |
|---|---|---|
| RES-T1 | Schema + migration for resume entities | One active resume per user; unique claim offsets |
| RES-T2 | File validation + text extraction (pdf, docx, plain) | Tests: wrong type, oversize, empty, corrupt, scanned-like → correct states |
| RES-T3 | `locateQuote()` pure function | Tests: exact, whitespace-diff, repeated quote (first unused occurrence), missing → null |
| RES-T4 | LLM structuring prompt + schema + fake-gateway tests | Injection fixture inside resume yields normal output and no extra fields |
| RES-T5 | Topic mapping (alias table, candidate topics) | "ReactJS", "React.js" → `react` |
| RES-T6 | Review workspace UI + highlight | e2e: select claim → highlight in view; confirm/edit/exclude persist |
| RES-T7 | Deletion + retention | After delete no rows remain; file never touches disk |
| RES-T8 | Authorization tests | User B gets 404 for user A's resume/claims |

## Definition of Done
All tasks pass; AC-1, AC-2 demonstrable; evidence recorded in PROGRESS.
