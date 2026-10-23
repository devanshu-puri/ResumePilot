# RULES-HACKTOBERFEST.md — compliance rules for the Hack Day / Track 01

> **Read this before any submission-related action.** Agents must follow section 3 as hard rules.
> **Honesty note:** the official Track 01 rules were NOT found. The sponsor page (`hacktober.awsatria.tech/star.html`) only lists repos to star. Section 1 is what could be verified; section 2 is unverified and must be confirmed with organizers; section 3 is conservative defaults chosen to avoid disqualification under *any* plausible rule set.

## 1. Verified facts (with source)
| Fact | Source |
|---|---|
| Hacktoberfest 2026 is no longer a pull-request count challenge; it focuses on building with **open-source AI / open-weight models**. | hacktoberfest.com (FAQ, llms.txt) |
| Hack Days are one-day structured mini-hackathons where participants **build open-source AI projects during the event**. | hacktoberfest.com FAQ |
| Hack Days must use MLH **OrganizerHQ Challenges** for project submissions and judging. | hacktoberfest.com FAQ |
| Hack Day Bengaluru '26: in-person, Ramaiah Institute of Technology, **October 9, 2026**, registration closed Oct 4, 2026; run with IEEE CIS Bangalore; AWS Student Builder Groups and Google Gemma as resource partners. | Internshala listing |
| The sponsor star page lists 7 DeepAgentLabs repos (Track 01) and 1 Great Data Labs repo (all tracks) to star. It states no judging criteria. | hacktober.awsatria.tech/star.html |

## 2. Unverified — confirm with organizers/OrganizerHQ page BEFORE building further
- [ ] **Date:** today is 2026-10-23, after the Oct 9 Hack Day. Is your event a different/later one, an online challenge, or a post-event submission window? If the submission window closed, none of this can qualify.
- [ ] Exact **Track 01 criteria**: must the project *use* DeepAgentLabs tools, or are they optional bonus? How many and how deeply?
- [ ] **"Built during the event"**: is pre-written code or pre-written planning (these docs) allowed? Is a fresh repo/first-commit time checked?
- [ ] **Open-source requirement:** required license? public repo by when?
- [ ] **Open-weight model requirement:** must the AI core use open-weight/open-source models? Are hosted closed APIs disqualifying or just not preferred?
- [ ] **AI-assisted coding** (Antigravity, etc.): allowed? disclosure needed?
- [ ] Team size, submission fields (demo video, repo, description), deadline and timezone, judging rubric, prize eligibility (Track 01 vs "all tracks" sponsor).
- [ ] Is starring the repos required, scored, or just encouraged? How is it verified (GitHub username in submission?).

## 3. Hard rules for agents and the team (conservative defaults)
**R1 — Open source from commit 1.** Public GitHub repo, `LICENSE` (MIT unless organizers require otherwise), no private forks of code you submit.
**R2 — Honest build history.** Never rewrite/squash history to hide when work happened. Commit regularly during the event window. If planning docs were written before the event, say so in the README ("Planning docs authored before the event; all application code written during it") — only if true.
**R3 — Open-weight AI by default.** The `LlmGateway` default provider must be an open-weight model (e.g., a Gemma-family model through a local or hosted open-weight runtime). Closed-API providers may exist only as an optional, off-by-default adapter. Record the model name and license in README. (Assumption — see §2.)
**R4 — Truthful sponsor usage.** Claim an integration only if it is DONE with evidence in `PROGRESS.md` (QA-T1 agentic-evals, QA-T2 great-generator). No logos or "powered by" claims for tools we don't use. Never imply sponsor endorsement.
**R5 — Star the sponsor repos from your own accounts** (all 8 on the star page) and record the GitHub usernames in the submission if a field exists. Do not use bots, multiple accounts, or ask others to star on your behalf in bulk.
**R6 — No PR/issue spam.** Do not open drive-by PRs, issues, or discussions on sponsor repos to look active. Any contribution there must be genuine, minimal, and follow their CONTRIBUTING.md.
**R7 — Attribution & licences.** Every third-party library/content has a compatible licence; `THIRD_PARTY.md` lists them. No copied code/text/images without permission. Library content = original notes + attributed links (already our policy).
**R8 — No secrets, no personal data.** No keys in the repo (`.env.example` placeholders only; scan before pushing). Demo uses only clearly labelled synthetic data; no real student resumes.
**R9 — Demo integrity.** The demo video/live demo shows only working features. Anything unfinished is listed under Known Limitations. No mocked screens presented as functional (matches invariant I-01).
**R10 — Code of conduct.** MLH events expect adherence to the MLH Code of Conduct (confirm current text); be respectful to mentors, judges, other teams.
**R11 — Submit through the official channel** (OrganizerHQ Challenges) before the deadline; keep a screenshot of the confirmation. Don't rely on email/DM.
**R12 — Disclosure of AI assistance.** README section "How this was built": tools used (e.g., Antigravity, LLM provider), what humans reviewed and tested.

## 4. Pre-submission checklist
- [ ] §2 questions answered (paste answers + source/date into `MEMORY.md` → Decision Log)
- [ ] Public repo, LICENSE present, README with setup works on a clean clone
- [ ] Commit history shows work during the event window
- [ ] Default model is open-weight; model + licence documented
- [ ] Sponsor integrations only those marked DONE; evidence linked
- [ ] All 8 repos starred; usernames recorded
- [ ] Secrets scan clean; `.env.example` placeholders only
- [ ] Demo video ≤ required length; shows journey 1→2 (resume → interview → gap → library)
- [ ] Known Limitations section accurate
- [ ] Submission confirmed in OrganizerHQ; screenshot saved
