# ResumePilot Design System (`DESIGN.md`)

> Adapted from the uploaded StashBase spec: a **blueprint / developer-editorial** language — monochrome foundation, hairlines, corner ticks — with **selective, meaningful colour added**. Colour here always *encodes something* (which module, how well an answer scored, whether evidence exists). If a colour doesn't carry meaning, it isn't used.

---

## 1. Philosophy

1. **Monochrome foundation, selective hue.** Paper, ink, hairlines carry ~90% of every screen. Hue appears only as small marks (ticks, dots, badges, thin bars) and pale washes — never as large fills.
2. **Colour is never the only signal.** Every colour is paired with a word or icon ("Strong 3/4", "Not scored").
3. **Blueprint framing.** Hairline borders, 10 px corner ticks on one hero panel per screen, diagonal hatch separators, dot-grid backdrops on empty states.
4. **Original vs interpretation is visible.** Text from the user's resume is set in the editorial serif; app/AI interpretation is set in the sans. Always.
5. **Honest empty states.** No decorative charts; "no data" uses hatch/dot-grid, not zeros.
6. **Mechanical, quick motion.** 120–420 ms, spring only on small icons; everything off under `prefers-reduced-motion`.

---

## 2. Colour system

### 2.1 Roles at a glance
| Role | Light | Dark | Used for |
|---|---|---|---|
| **Ink** (primary action) | `#191919` | `#E8E8E8` | Primary buttons, headings, focus ring |
| **Resume** — terracotta | text `#A24826` · mark `#D97757` · wash `#FBEDE7` | `#E8896A` · wash `#33201A` | Resume module, source-text highlights, original-quote marker |
| **Interview** — cobalt | `#2F54D6` · wash `#EBEFFD` | `#8EA6FF` · wash `#1B2240` | Interview module, active question, follow-up links |
| **Library** — teal | `#0E7490` · wash `#E5F4F8` | `#67D4EC` · wash `#12303A` | Library module, resources, objectives |
| **Strong** — forest | `#2F6B3F` · wash `#E6F3E8` | `#86C998` · wash `#1B3122` | Score ≥ 75 %, passed, confirmed |
| **Partial** — amber | `#8A5A00` · wash `#FFF4DB` | `#E8B65A` · wash `#2E2412` | Score 40–74 %, needs review, candidate topic |
| **Weak** — crimson | text `#B3342E` · mark `#C2413B` · wash `#FDECEA` | `#F0867F` · wash `#35191A` | Score < 40 %, open gap, failed |
| **Not scored** | gray + hatch | gray + hatch | Inconclusive / pending / no evidence |

Module hues identify *where you are*; Strong/Partial/Weak identify *how it went*. They are different hue families on purpose (terracotta/cobalt/teal vs green/amber/red) so a teal Library badge is never mistaken for a "passed" green one.

Score bands (`strong ≥ 0.75`, `partial 0.40–0.74`, `weak < 0.40`) are **display thresholds only**, kept in one constants file. They are separate from the gap rule in `blueprint.md §4` (which uses 0.6 / 0.7) — don't merge them.

### 2.2 Contrast (verified by calculation, WCAG 2.x)
On `--paper #FCFCFC`: resume text 5.9, interview 6.1, library 5.2, strong 6.2, partial 5.8, weak text 5.9, ink-2 5.9 — all ≥ 4.5:1. On their own washes: all ≥ 4.5:1 (lowest 4.75). Dark theme on `#101010`: all ≥ 7:1. `--resume-mark` (#D97757) and `--weak-mark` are **non-text** only (≥ 3:1 is required and they are used for dots/ticks/borders). Re-verify with axe in CI when tokens change.

### 2.3 Usage rules
- **One module hue per screen region.** The Resume screen uses terracotta; don't also paint cobalt on it except the "Create question set" link target.
- **Hue as mark, not fill:** 2 px left tick on the active nav item; 6 px dot before eyebrow; 1 px top rule on a panel header; badge outline + wash. Never fill a whole card or button with a module hue.
- **Primary buttons stay ink.** Hue never changes primary-button colour.
- **Score colours only on score UI** (ScoreBar, criterion rows, badges). Not on headings or decoration.
- **Max 3 hues visible in one viewport** (excluding the nav's four small ticks).
- Charts: not used in v1. If added, series use ink-tone + module hue only.

---

## 3. Typography

```css
:root {
  --sans: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --display: "Space Grotesk", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --book: "Newsreader", Georgia, "Times New Roman", serif;   /* ORIGINAL resume text & interview question prompts */
}
```
| Role | Font | Size | Weight | Line | Tracking |
|---|---|---|---|---|---|
| Landing hero | display | `clamp(36px, 6vw, 62px)` | 400 | 1.0 | −0.045em |
| Page title (H1) | display | 28px | 400 | 1.15 | −0.035em |
| Section (H2) | display | 20px | 500 | 1.3 | −0.02em |
| Question prompt | **book** | 20–22px | 400 | 1.5 (max 68ch) | −0.01em |
| Resume original text / quotes | **book** | 15–16px | 400 | 1.6 | 0 |
| Body / interpretation | sans | 15px (16 mobile) | 400 | 1.55 | −0.02em |
| UI label | sans | 13–14px | 500 | 1.4 | −0.01em |
| Eyebrow | mono | 10.5–12px | 500 | 1.2 | +0.12em, uppercase |
| Code, offsets, IDs, scores | mono | 12–13px | 400/500 | 1.5 | 0 |

Rule: **serif = the user's own words (or the question being asked); sans = what the app says about them.**

---

## 4. Tokens

```css
:root {
  /* Surfaces */
  --paper:#FCFCFC; --paper-2:#F4F4F4; --card:#FFFFFF; --wash:#F1F1F1; --wash-2:#E3E3E3;
  /* Ink */
  --ink:#191919; --ink-2:#636363; --ink-4:#8A8A8A; --muted:#636363; --on-ink:#FFFFFF;
  /* Lines */
  --line:#E2E2E2; --line-3:#DCDCDC; --faint:#EFEFEF; --hatch:#CCCCCC; --separator:#DEDEDE; --dot:#ECECEC;

  /* Module hues */
  --resume:#A24826;     --resume-mark:#D97757;  --resume-wash:#FBEDE7;
  --interview:#2F54D6;  --interview-wash:#EBEFFD;
  --library:#0E7490;    --library-wash:#E5F4F8;

  /* Outcome hues */
  --strong:#2F6B3F;  --strong-wash:#E6F3E8;
  --partial:#8A5A00; --partial-wash:#FFF4DB;
  --weak:#B3342E;    --weak-mark:#C2413B; --weak-wash:#FDECEA;

  /* Elevation: popovers & dialogs only; panels use hairlines */
  --lift-sm:0 1px 2px rgba(0,0,0,.05);
  --lift-lg:0 0 0 1px rgba(0,0,0,.015),0 1px 3px rgba(0,0,0,.05),0 10px 24px -8px rgba(0,0,0,.09),0 32px 72px -24px rgba(0,0,0,.16);

  --radius-sm:2px; --radius:4px; --radius-lg:8px;
  --max:1120px; --hairline:1px;
  --ease-spring:cubic-bezier(.34,1.56,.64,1);
  --ease-smooth:cubic-bezier(.76,0,.24,1);
  --ease-mechanical:cubic-bezier(.42,0,.58,1);
  --ease-entrance:cubic-bezier(.2,.7,.3,1);
}
@media (min-resolution:1.5dppx){ :root{ --hairline:.5px; } }

:root[data-theme="dark"] {
  --paper:#101010; --paper-2:#1A1A1A; --card:#181818; --wash:#242424; --wash-2:#333333;
  --ink:#E8E8E8; --ink-2:#A3A3A3; --ink-4:#7D7D7D; --muted:#A3A3A3; --on-ink:#101010;
  --line:#2C2C2C; --line-3:#3C3C3C; --faint:#232323; --hatch:#4D4D4D; --separator:#333; --dot:#232323;

  --resume:#E8896A; --resume-mark:#E8896A; --resume-wash:#33201A;
  --interview:#8EA6FF; --interview-wash:#1B2240;
  --library:#67D4EC; --library-wash:#12303A;
  --strong:#86C998; --strong-wash:#1B3122;
  --partial:#E8B65A; --partial-wash:#2E2412;
  --weak:#F0867F; --weak-mark:#F0867F; --weak-wash:#35191A;
  --lift-lg:0 1px 3px rgba(0,0,0,.3),0 10px 24px -8px rgba(0,0,0,.45),0 32px 72px -24px rgba(0,0,0,.6);
}
/* Respect system preference when the user hasn't chosen */
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){ /* mirror the dark block above (generate from one token source, don't hand-duplicate) */ }
}
```
Implementation note: keep tokens in one source file and generate both blocks; expose them to Tailwind via `theme.extend.colors` so utilities (`text-resume`, `bg-strong-wash`) use the same variables.

Module → token map (single place in code): `resume → --resume`, `interview → --interview`, `library → --library`. Home and History are neutral ink.

---

## 5. Layout
- **Desktop ≥1024:** 220 px left rail (Home · Resume · Interview · Library; History & Settings at the foot). Active item = ink text + **2 px left tick in its module hue**. Content max 1120 px; detail screens may use 2 columns.
- **Tablet 640–1023:** icon rail 56 px; two columns only if each ≥ 320 px.
- **Mobile <640:** compact top bar + bottom tab bar (4 items; active = ink icon + 2 px top tick in module hue). Single column; full-width primary action; sticky submit bar only with equal bottom padding on the editor.
- Dot-grid backdrop (`.dotgrid`) only on empty states and the landing page. Hatch separator (`.separator`) between major page sections, max 2 per page.

---

## 6. Components

### 6.1 Core (build once in `components/ui/`)
Button · Input/Textarea · **CodeBox** (mono, internal horizontal scroll only) · Select · Tabs · Dialog · Toast · InlineAlert · Skeleton · EmptyState · Stepper · Table (stacks on mobile).

### 6.2 Badge variants (text + icon always)
| Variant | Style | Example label |
|---|---|---|
| neutral | `--wash` bg, `--ink-2` | Informational |
| strong | `--strong-wash` / `--strong`, ✓ | Passed · Strong 3/4 |
| partial | `--partial-wash` / `--partial`, ◐ | Needs review · Partial 2/4 |
| weak | `--weak-wash` / `--weak`, ! | Open gap · Weak 1/4 |
| notscored | transparent, hatch border, `--ink-2`, ○ | Not scored · Pending |
| module | wash of that module + 1 px hue border | Resume · Interview · Library |

### 6.3 ScoreBar
Text first (`3 / 4`, mono), then a 4 px bar: track `--wash-2`, fill in the band colour. When not scored: no fill, diagonal hatch track and the words "Not scored".

### 6.4 CriterionRow (evaluation breakdown)
`[module-neutral name] [ScoreBar] [one-line feedback]` and a disclosure with the quoted evidence (serif, left rule in `--interview`). Rows never reorder by score.

### 6.5 SourceHighlight (resume ↔ claim)
Selected claim's source span: `--resume-wash` background + 2 px `--resume-mark` underline, serif text. Unconfirmed claims: dashed underline; excluded: strikethrough in `--ink-4`. Interpretation panel is sans with a "From your resume" eyebrow above the serif quote.

### 6.6 EvidenceChip
Mono, 11 px, hairline border, leading 6 px dot in the evidence's band colour; text like `Interview · Redis caching · 0.40`. Always links to the underlying record. This is the visual proof behind every "because…" line.

### 6.7 GapMarker
Weak-coloured 6 px dot + "Open gap" + `gapRuleVersion` in mono tooltip. Never appears for single observations.

### 6.8 Eyebrow with module dash
```css
.eyebrow{font:500 10.5px/1.2 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);
  display:inline-flex;gap:10px;align-items:center;padding:6px 11px 5px;border:1px solid var(--line-3)}
.eyebrow::before{content:"";width:14px;height:2px;background:var(--module,var(--hatch))}
.module-resume{--module:var(--resume-mark)} .module-interview{--module:var(--interview)} .module-library{--module:var(--library)}
```

### 6.9 Framed panel (corner ticks) — one per screen
```css
.framed{position:relative;border:1px solid var(--faint);background:var(--paper)}
.framed::before,.framed::after{content:"";position:absolute;z-index:4;left:-1px;right:-1px;height:10px;pointer-events:none}
.framed::before{top:-1px;background:
  linear-gradient(var(--ink),var(--ink)) left top/10px 1.5px no-repeat,linear-gradient(var(--ink),var(--ink)) left top/1.5px 10px no-repeat,
  linear-gradient(var(--ink),var(--ink)) right top/10px 1.5px no-repeat,linear-gradient(var(--ink),var(--ink)) right top/1.5px 10px no-repeat}
.framed::after{bottom:-1px;background:
  linear-gradient(var(--ink),var(--ink)) left bottom/10px 1.5px no-repeat,linear-gradient(var(--ink),var(--ink)) left bottom/1.5px 10px no-repeat,
  linear-gradient(var(--ink),var(--ink)) right bottom/10px 1.5px no-repeat,linear-gradient(var(--ink),var(--ink)) right bottom/1.5px 10px no-repeat}
```
Use for: Home Next-Best-Action, active question workspace, resume review canvas. Not on lists.

### 6.10 Separator and dot grid
```css
.separator{height:40px;background:repeating-linear-gradient(135deg,transparent 0 3.5px,var(--separator) 4px 4.5px,transparent 5px)}
.dotgrid{background:radial-gradient(var(--dot) 1.3px,transparent 1.4px);background-size:24px 24px}
.hatch{background:repeating-linear-gradient(135deg,transparent 0 3px,var(--hatch) 3.5px 4px,transparent 4.5px)} /* "not scored" tracks */
```

### 6.11 Buttons (rolling sweep, kept from StashBase)
```css
.button{position:relative;min-height:44px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;
  overflow:hidden;isolation:isolate;border:1px solid var(--ink);border-radius:var(--radius);background:transparent;color:var(--ink);
  font:400 15px/1 var(--display);letter-spacing:-.04em;cursor:pointer;transition:border-color .42s var(--ease-smooth)}
.button-dark{background:var(--ink);color:var(--on-ink)}
.button-sweep{position:absolute;inset:0;z-index:0;background:var(--paper);transform:translateX(-101%);transition:transform .42s var(--ease-smooth)}
.button-label{position:relative;z-index:2;display:block;height:1.15em;overflow:hidden;line-height:1.15}
.button-label-line{display:flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap;transition:transform .42s var(--ease-smooth)}
.button-label-line:last-child{position:absolute;top:100%;left:0;right:0;color:var(--ink)}
.button:hover .button-sweep,.button:focus-visible .button-sweep{transform:none}
.button:hover .button-label-line,.button:focus-visible .button-label-line{transform:translateY(-100%)}
.button:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.button[disabled]{opacity:.45;cursor:not-allowed} /* always show the reason in adjacent text */
```
Variants: `dark` (primary), default (secondary outline), ghost, danger (outline `--weak`, sweep fills `--weak-wash`). Max one `dark` per screen.

### 6.12 Segmented control (sliding pill, kept)
```css
.seg{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;padding:3px;border-radius:10px;background:var(--wash)}
.seg::before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px - (var(--n) - 1)*2px)/var(--n));
  border-radius:7px;background:var(--card);box-shadow:0 1px 2px rgba(0,0,0,.08);transform:translateX(calc(var(--i)*(100% + 2px)));transition:transform .35s var(--ease-mechanical)}
.seg>button{position:relative;padding:5px 10px;border:0;border-radius:7px;background:none;color:var(--ink-2);font:500 13px var(--sans);cursor:pointer}
.seg [aria-selected="true"]{color:var(--ink)}
```
Use for: Resume review "Text | Claims", Library "All | Saved", theme toggle. (Set `--n`/`--i` from state.)

### 6.13 Evidence thread (signature visual, landing + Home only)
A dashed hairline path connects three small nodes — Resume (terracotta) → Interview (cobalt) → Library (teal) — with one mint bead travelling along it. It illustrates the product loop; it is never used as a fake activity indicator inside real data views.
```css
.thread-path{stroke:var(--line-3);stroke-width:1;stroke-dasharray:3 4;fill:none}
.pulse{stroke:#21C16B;stroke-width:2;stroke-linecap:round;stroke-dasharray:12 100;stroke-dashoffset:12;opacity:0;
  filter:drop-shadow(0 0 2px rgba(33,193,107,.5));animation:bead 4.8s cubic-bezier(.45,0,.4,1) infinite}
@keyframes bead{0%{stroke-dashoffset:12;opacity:0}4%,25%{opacity:1}30%,100%{stroke-dashoffset:-100;opacity:0}}
```
(Mint `#21C16B` is decorative-only, not a status colour.)

### 6.14 Optional entrance (landing only)
Staggered word blur-in from StashBase (`hero-title-in`, 0.7 s, 0.1 s per word). Not used inside the app.

---

## 7. Screen colour specs
| Screen | Colour behaviour |
|---|---|
| **Landing** | Ink/paper, dot grid, evidence thread; hero stays monochrome |
| **Home** | One framed Next-Best-Action panel; its eyebrow takes the target module's hue; EvidenceChips carry band colours; lists below neutral |
| **Resume review** | Terracotta source highlights; Strong badge on confirmed; Partial on candidate topics; weak only for failed extraction |
| **Interview workspace** | Cobalt eyebrow + 2 px cobalt rule beside the question; evaluation rows use band colours; "Not scored" = hatch |
| **Session report** | Per-criterion table with ScoreBars; "Topics to revisit" use GapMarker + EvidenceChips |
| **Library** | Teal eyebrow/ticks; status badges (Passed = strong, Needs review = partial, Evaluation failed = weak); "Informational only" = neutral |
| **Settings** | Fully neutral; danger actions outlined in `--weak` |

---

## 8. Motion
| Interaction | Spec |
|---|---|
| Button sweep | 420 ms `--ease-smooth` |
| Segmented pill | 350 ms `--ease-mechanical` |
| Nav tick / tab change | 120 ms opacity + 160 ms translate |
| Evaluation arrival | Rows fade in 120 ms each, stagger 40 ms; live-region announces completion |
| Spring | Icons only (`--ease-spring`, e.g. save-bookmark scale 1.15) |
| Pending evaluation | Hatch track shimmers 1.2 s linear loop |

```css
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .pulse{animation:none!important;opacity:0}
}
```

---

## 9. Accessibility & performance
1. Focus: 2 px ink outline, 3 px offset, on every interactive element (never colour-only).
2. Colour is never the sole carrier of meaning (see §1.2); verified with a grayscale screenshot test on the session report and Library list.
3. 44 px min touch targets; no horizontal overflow at 320 px; code scrolls inside its own box.
4. Live region (`aria-live="polite"`) for evaluation completion and save confirmations.
5. Hairline 0.5 px on ≥1.5 dppx screens.
6. Fonts: self-host Space Grotesk, JetBrains Mono, Newsreader with `font-display: swap`; fall back to the stacks above. Load Newsreader only on screens that show original text/questions.
7. CI: axe (no serious/critical), Playwright screenshots at 390×844 and 1280×800 in light and dark.

## 10. Don'ts
No module-hue fills on large areas · no red/green as sole signal · no gradients or glow outside the evidence thread bead · no emoji as UI icons (the uploaded demo used emoji; replace with a single consistent icon set) · no ratings, streaks, confetti · no fake chart in empty states · no sample resume text in production builds.

## 11. Changes from the uploaded StashBase spec
- Removed StashBase-specific product pieces (JobFit demo window, star button, Claude persona, "Claude terracotta" as a brand colour). Terracotta is retained but re-purposed as the **Resume** hue.
- Added module hues, outcome (score) hues, washes, and verified contrast pairs.
- Added the serif-for-original-text rule, ScoreBar, EvidenceChip, GapMarker, SourceHighlight, badges, module-tinted eyebrow and nav ticks.
- Kept: Space Grotesk / JetBrains Mono / Newsreader, hairlines, corner ticks, hatch separator, dot grid, rolling button, sliding segmented control, bead pulse (limited), reduced-motion handling.
- Reduced: shadows (popovers/dialogs only), radius (2–8 px), motion on in-app screens.
