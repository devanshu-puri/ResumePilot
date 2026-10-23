---
version: 1.0-blended
name: ResumePilot Enterprise Design System (Oracle Minimalist Blend)
description: An enterprise developer-editorial design system built on Oracle's warm neutral ladder combined with ResumePilot's closed-loop evidence architecture. Six numbered greys carry almost every surface, a single dark charcoal (#312d2a) carries every primary action at 4px radius, and the iconic brand red (#c74634) is reserved for the wordmark alone. Two display registers coexist, being a Georgia serif across product/interview pages and original resume quotes, contrasting with a clean humanist sans with an extreme 400-to-800 weight jump for section headings. Zero drop shadows; depth is conveyed solely through tonal ladder steps and 1px hairline rules, with a single 40x4px gold bar (#f0cc71) under hero headlines as the whole ornament budget.
colors:
  primary: "#312d2a"
  primary-pressed: "#47423e"
  on-primary: "#ffffff"
  brand-mark: "#c74634"
  ink: "#161513"
  ink-deep: "#211e1c"
  canvas: "#ffffff"
  canvas-soft: "#fbf9f8"
  canvas-tint: "#f5f4f2"
  canvas-warm: "#f1efed"
  hairline: "#e4e1dd"
  divider: "#e9e7e4"
  field-border: "#d4cfca"
  link: "#006b8f"
  accent-gold: "#f0cc71"
  accent-gold-soft: "#f7e0a1"
  band-teal: "#d6e5e5"
  band-forest: "#33553c"
  focus: "#227e9e"
  error: "#d63b25"
  disabled-ink: "#aea8a2"
  # Domain Evidence & Outcome Hues
  resume: "#a24826"
  resume-mark: "#d97757"
  resume-wash: "#fbf4f1"
  interview: "#2f54d6"
  interview-wash: "#f1f4fd"
  library: "#0e7490"
  library-wash: "#ebf5f8"
  strong: "#33553c"
  strong-wash: "#eef4f0"
  partial: "#8a5a00"
  partial-wash: "#fcf7ee"
  weak: "#d63b25"
  weak-mark: "#d63b25"
  weak-wash: "#fdf1ef"
typography:
  display-serif-xl:
    fontFamily: Georgia, serif
    fontSize: 56px
    fontWeight: 400
    lineHeight: 67.2px
    letterSpacing: 0
  display-serif-lg:
    fontFamily: Georgia, serif
    fontSize: 40px
    fontWeight: 400
    lineHeight: 48px
    letterSpacing: 0
  display-serif-md:
    fontFamily: Georgia, serif
    fontSize: 36px
    fontWeight: 400
    lineHeight: 43.2px
    letterSpacing: 0
  display-sans-lg:
    fontFamily: Inter, sans-serif
    fontSize: 40px
    fontWeight: 300
    lineHeight: 52px
    letterSpacing: 0
  display-sans-md:
    fontFamily: Inter, sans-serif
    fontSize: 32px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0
  heading-xl:
    fontFamily: Inter, sans-serif
    fontSize: 28px
    fontWeight: 800
    lineHeight: 33.6px
    letterSpacing: 0
  heading-lg:
    fontFamily: Inter, sans-serif
    fontSize: 24px
    fontWeight: 800
    lineHeight: 28.8px
    letterSpacing: 0
  heading-md:
    fontFamily: Inter, sans-serif
    fontSize: 20px
    fontWeight: 800
    lineHeight: 24px
    letterSpacing: 0
  heading-sm:
    fontFamily: Inter, sans-serif
    fontSize: 18px
    fontWeight: 800
    lineHeight: 21.6px
    letterSpacing: 0
  heading-card:
    fontFamily: Inter, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0
  lead:
    fontFamily: Inter, sans-serif
    fontSize: 24px
    fontWeight: 400
    lineHeight: 33.6px
    letterSpacing: 0
  body:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 22.4px
    letterSpacing: 0
  body-loose:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: 350
    lineHeight: 24px
    letterSpacing: 0
  body-strong:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: 700
    lineHeight: 22.4px
    letterSpacing: 0
  label:
    fontFamily: Inter, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 16.8px
    letterSpacing: 0
  label-strong:
    fontFamily: Inter, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: Inter, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 15px
  full: 9999px
spacing:
  xs: 10px
  sm: 12px
  md: 16px
  lg: 18px
  xl: 20px
  xxl: 24px
  xxxl: 32px
  section: 48px
  gutter: 72px
components:
  masthead:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: 64px
  logo-wordmark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.brand-mark}"
    typography: "{typography.heading-lg}"
    rounded: "{rounded.none}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    borderColor: "{colors.field-border}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  product-subnav:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: 56px
  product-subnav-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: 56px
  subnav-active-bar:
    backgroundColor: "{colors.accent-gold-soft}"
    rounded: "{rounded.none}"
    height: 4px
    width: 60px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
  button-primary-disabled:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.disabled-ink}"
    typography: "{typography.label}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    borderColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
  button-tertiary:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "10px 16px"
  hero-band:
    backgroundColor: "{colors.canvas-warm}"
    textColor: "{colors.ink}"
    typography: "{typography.display-serif-md}"
    rounded: "{rounded.none}"
    padding: "48px"
  hero-eyebrow-rule:
    backgroundColor: "{colors.accent-gold}"
    rounded: "{rounded.none}"
    width: "40px"
    height: "4px"
  product-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    padding: "{spacing.xxl}"
---

# ResumePilot Design System (`DESIGN.md`)

> **Minimalist Enterprise Blend**: ResumePilot blends **Oracle's warm neutral ladder and corporate typography registers** with an **evidence-backed developer-editorial design language**. Six numbered warm neutrals carry nearly every surface, action charcoal (`#312D2A`) powers every action at a crisp 4px radius, and brand red (`#C74634`) is reserved exclusively for the wordmark anchor. Shadows are eliminated entirely: depth is conveyed through tonal shifts on the neutral ladder and 1px hairline rules.

---

## 1. Core Philosophy & Design Principles

1. **A Six-Rung Warm Neutral Ladder**: The ground of the application is built on six numbered warm neutrals (`canvas` `#ffffff` → `canvas-soft` `#fbf9f8` → `canvas-tint` `#f5f4f2` → `canvas-warm` `#f1efed` → `hairline` `#e4e1dd` → `ink-deep` `#211e1c`). Transitions between sections or container surfaces read as gentle shifts in ambient light rather than harsh borders or noisy shadows.
2. **Action Charcoal Restraint**: Every interactive primary action runs through `{colors.primary}` (`#312D2A`, active `#47423E`) at a 4px corner radius (`rounded.xs`) with `10px 16px` padding. No coloured primary CTAs, no gradients, and no noisy hover blooms.
3. **The Iconic Brand Mark**: Oracle Red (`#C74634`) appears strictly on the wordmark/logo mark and nowhere else in the interface chrome. Its extreme scarcity gives the brand instant executive authority.
4. **The Gold Eyebrow Ornament**: A single `40 × 4px` horizontal bar in `{colors.accent-gold}` (`#F0CC71`) sits beneath major hero headlines. It is the system's whole decorative ornament budget, giving warmth and gravitas against the neutral ground.
5. **Two Distinct Display Registers**:
   - **Georgia Display Serif**: Carries major hero titles, section headlines, original user resume quotes, and interview question stems. Its bracketed serifs and ball terminals provide authoritative editorial poise.
   - **Inter / Oracle Sans**: The UI workhorse. Running copy is set at weight 350/400, while section headings jump straight to 800 (`heading-sm` to `heading-xl`). This extreme weight jump carries structure without requiring oversized font dimensions.
6. **Zero Elevation Shadows**: No drop shadows on cards, modals, nav bars, or dropdowns. Elevation is achieved solely by stepping up or down the neutral ladder (e.g., pure white `canvas` on a `canvas-warm` band), bounded by 1px `hairline` rules where surfaces share the same rung.
7. **Original Text vs Interpretation Integrity**: User resume text and interviewer question stems are set in Georgia Serif; app analysis, rubrics, and feedback are set in the Sans.
8. **Chromatic Colour at Band Scale Only**: Aside from small semantic status markers on score bars, chromatic color enters the UI only at full band scale (`band-teal` `#D6E5E5` or `band-forest` `#33553C`).

---

## 2. Color System

### 2.1 The Warm Neutral Ladder
| Token | Light Hex | Dark Hex | Role & Purpose |
|---|---|---|---|
| `canvas` (`--paper`) | `#FFFFFF` | `#161513` | Masthead, pure white cards, bright section bands, dialog background |
| `canvas-soft` (`--paper-2`) | `#FBF9F8` | `#1E1B19` | Standard section fill, subtle card wells, empty-state containers |
| `canvas-tint` (`--wash`) | `#F5F4F2` | `#24211F` | Table headers, secondary toolbars, filter panels, segmented control tracks |
| `canvas-warm` (`--wash-2`) | `#F1EFED` | `#2A2724` | Hero bands, stat panels, highlighted question callouts |
| `hairline` (`--line`) | `#E4E1DD` | `#383431` | 1px card borders, table row dividers, disabled button borders |
| `divider` (`--line-3`) | `#E9E7E4` | `#322E2B` | Vertical column rules, panel separators |
| `field-border` | `#D4CFCA` | `#4A4541` | Form inputs, search fields (1 step darker than hairline) |
| `ink` (`--ink`) | `#161513` | `#F1EFED` | Primary headings, body copy, default typography |
| `ink-deep` | `#211E1C` | `#FFFFFF` | Dark navigation bands, inverted section headers |
| `disabled-ink` | `#AEA8A2` | `#6E6862` | Disabled controls, placeholder copy |

### 2.2 Action & Accent Palette
| Role | Token | Light Hex | Dark Hex | Usage |
|---|---|---|---|---|
| **Action Primary** | `primary` | `#312D2A` | `#F1EFED` | Primary filled action buttons, active states |
| **Action Pressed** | `primary-pressed` | `#47423E` | `#E4E1DD` | Active / pressed button state |
| **On Primary** | `on-primary` | `#FFFFFF` | `#161513` | Text on action buttons, inverted bands |
| **Brand Mark** | `brand-mark` | `#C74634` | `#E05846` | **Strictly reserved** for the logo wordmark / badge mark |
| **Gold Rule** | `accent-gold` | `#F0CC71` | `#F0CC71` | 40 × 4px rule below hero headlines |
| **Gold Tab** | `accent-gold-soft` | `#F7E0A1` | `#F7E0A1` | Active navigation indicator bar |
| **Inline Link** | `link` | `#006B8F` | `#4EB7DE` | Deep teal-blue inline links (ununderlined) |
| **Focus Ring** | `focus` | `#227E9E` | `#4EB7DE` | 2px accessible focus ring |
| **Band Teal** | `band-teal` | `#D6E5E5` | `#1C3333` | Pale teal full-width transition band |
| **Band Forest** | `band-forest` | `#33553C` | `#1E3827` | Deep green enterprise banner with white text |

### 2.3 Evidence & Evaluation Taxonomy
To preserve ResumePilot's closed-loop interview scoring:
| Role | Base Token | Wash Token | Purpose |
|---|---|---|---|
| **Resume Claims** | `#A24826` (`--resume`) | `#FBF4F1` | Resume module, extracted claim spans |
| **Interview Defense** | `#2F54D6` (`--interview`) | `#F1F4FD` | Live defense questions, interactive drill steps |
| **Tech Bites / Library** | `#0E7490` (`--library`) | `#EBF5F8` | Learning resources, architectural mental models |
| **Strong (≥ 75%)** | `#33553C` (`--strong`) | `#EEF4F0` | Confirmed mastery, passing rubrics |
| **Partial (40–74%)** | `#8A5A00` (`--partial`) | `#FCF7EE` | Candidate gap, partial rubric credit |
| **Weak (< 40%)** | `#D63B25` (`--weak`) | `#FDF1EF` | Open gap, unevidenced claim, validation error |

---

## 3. Typography Scale & Registers

```css
:root {
  --serif: Georgia, "Times New Roman", serif;
  --sans: "Inter", "Oracle Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --mono: "JetBrains Mono", Consolas, monospace;
}
```

### 3.1 Typographic Hierarchy
| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Purpose |
|---|---|---|---|---|---|---|
| `display-serif-xl` | Georgia | 56px | 400 | 67.2px (1.2) | 0 | Landing & Hero headline |
| `display-serif-lg` | Georgia | 40px | 400 | 48.0px (1.2) | 0 | Major page titles |
| `display-serif-md` | Georgia | 36px | 400 | 43.2px (1.2) | 0 | Product page & interview titles |
| `display-sans-lg` | Inter | 40px | 300 | 52.0px (1.3) | 0 | Light corporate headings |
| `heading-xl` | Inter | 28px | 800 | 33.6px (1.2) | 0 | Section headings (high weight contrast) |
| `heading-lg` | Inter | 24px | 800 | 28.8px (1.2) | 0 | Panel headings |
| `heading-md` | Inter | 20px | 800 | 24.0px (1.2) | 0 | Sub-section headings |
| `heading-sm` | Inter | 18px | 800 | 21.6px (1.2) | 0 | Card headings |
| `lead` | Inter | 24px | 400 | 33.6px (1.4) | 0 | Standfirst intro paragraph |
| `body` | Inter | 16px | 400 | 22.4px (1.4) | 0 | Product page running copy |
| `body-loose` | Inter | 16px | 350 | 24.0px (1.5) | 0 | Index page body copy |
| `body-strong` | Inter | 16px | 700 | 22.4px (1.4) | 0 | Emphasized items & bold copy |
| `label` | Inter | 14px | 500 | 16.8px (1.2) | 0 | Button labels, tabs, controls |
| `label-strong` | Inter | 14px | 600 | 20.0px (1.43)| 0 | Tile labels & badges |
| `caption` | Inter | 12px | 400 | 20.0px (1.67)| 0 | Footer links, fine print |
| `code` / `mono` | Mono | 12–13px | 400/500 | 1.5 | 0 | CodeBox, offsets, evidence chips |

### 3.2 Typographic Principles
- **Zero Tracking**: Letter-spacing is explicitly `0` across every single role. No tracked-out eyebrows or artificially squeezed display titles.
- **Strict Line-Height Registers**: Headings and display titles maintain a tight `1.2` ratio; body copy maintains an open `1.4`–`1.5` ratio.
- **The 400 → 800 Weight Jump**: Hierarchy is communicated by weight jumps rather than oversized text. A 20px or 24px 800-weight heading above a 16px 400-weight body creates clean, unmistakable structure.

---

## 4. Spacing, Geometry & Radii

### 4.1 Spacing Scale
- `xs`: `10px`
- `sm`: `12px`
- `md`: `16px`
- `lg`: `18px`
- `xl`: `20px`
- `xxl`: `24px`
- `xxxl`: `32px`
- `section`: `48px` (The universal rhythm constant: full-width bands are padded `48px 0`)
- `gutter`: `72px` (Outer horizontal margins on desktop containers)

### 4.2 Border Radius Scale
- `rounded.none` (`0px`): Full-width bands, sections, masthead, product sub-nav, footer, gold eyebrow rule.
- `rounded.xs` (`4px`): All action buttons, chips, and small controls.
- `rounded.sm` (`6px`): Text inputs, search fields, textareas.
- `rounded.md` (`8px`): Product cards, dialog surfaces, media frames.
- `rounded.lg` (`12px`): Navigation tiles, filter trays.
- `rounded.xl` (`15px`): Content cards and stat panels.
- `rounded.full` (`9999px`): Circular play controls, evidence indicator dots.

---

## 5. Elevation & Depth (Zero Shadows)

| Level | Treatment | Application |
|---|---|---|
| **0** | Flat fill on the neutral ladder | Every band, section ground, header, footer (`box-shadow: none`) |
| **1** | One rung shift on ladder | White card on a `canvas-soft` or `canvas-warm` band |
| **2** | 1px `hairline` border (`#E4E1DD`) | Bounding cards, modals, table cells, or tiles on the same rung |

There are **no drop shadows in the application chrome**. Depth is produced entirely by position on the neutral ladder and 1px hairline rules.

---

## 6. Components Specification

### 6.1 Action Buttons
- **Button Primary**: Background `{colors.primary}` (`#312D2A`), hover `{colors.primary-pressed}` (`#47423E`), text `#FFFFFF`, radius `4px` (`rounded.xs`), padding `10px 16px`, typography `label` (14px, 500 weight).
- **Button Secondary**: Transparent background, text `{colors.ink}`, 1px border `{colors.ink}`, radius `4px`, padding `10px 16px`.
- **Button Tertiary (Ghost)**: Transparent background, text `{colors.ink}`, hover background with 8% wash of ink.
- **Button Disabled**: Background `{colors.canvas-soft}`, text `{colors.disabled-ink}` (`#AEA8A2`), 1px border `{colors.hairline}`, cursor `not-allowed`.

### 6.2 The Hero Eyebrow Rule
- Component: `.hero-eyebrow-rule`
- Dimensions: `width: 40px`, `height: 4px`, `border-radius: 0`.
- Background: `{colors.accent-gold}` (`#F0CC71`).
- Placement: Positioned directly beneath major hero titles.

### 6.3 Text Inputs & Form Controls
- Background: `{colors.canvas}` (`#FFFFFF`).
- Text: `{colors.ink}` (`#161513`).
- Border: 1px `{colors.field-border}` (`#D4CFCA`). Focus ring: 2px `{colors.focus}` (`#227E9E`).
- Radius: `6px` (`rounded.sm`). Padding: `12px 18px`.

### 6.4 Product Cards & Panels
- Background: `{colors.canvas}` or `{colors.canvas-warm}`.
- Border: 1px `{colors.hairline}` (`#E4E1DD`).
- Radius: `8px` (`rounded.md`).
- Padding: `24px` (`spacing.xxl`).
- Shadow: `none`.

### 6.5 Evaluation & Rubric Chrome
- **ScoreBar**: Text ratio in mono (`3 / 4`), accompanied by a 4px bar with track in `canvas-tint` and fill in outcome color (`strong` green, `partial` amber, `weak` red). Unscored state uses diagonal hatch.
- **CriterionRow**: Question breakdown with evidence disclosure button. Quoted text set in Georgia serif with a 2px left border.
- **EvidenceChip**: 11px mono chip, hairline border, leading 6px colored indicator dot.

---

## 7. Do's and Don'ts

### Do
- Build page structure and hierarchy from the six-rung warm neutral ladder.
- Reserve `{colors.brand-mark}` (`#C74634`) exclusively for the wordmark / logo mark.
- Use Georgia serif for display titles, hero headlines, and original resume quotes.
- Use Inter / Oracle Sans with an extreme 400 → 800 weight jump for section headings and UI chrome.
- Maintain a single 40 × 4px `{colors.accent-gold}` rule below hero headlines.
- Maintain 48px section padding (`{spacing.section}`) across major page bands.
- Keep letter-spacing at `0` across every role.
- Rely on 1px hairline rules and tone steps for depth—never drop shadows.

### Don't
- Don't add drop shadows to cards, modals, or buttons.
- Don't use pure `#000000`; use warm near-black `{colors.ink}` (`#161513`).
- Don't paint colored primary CTA buttons (no blue, green, or red buttons for primary actions).
- Don't use brand red anywhere except the logo wordmark.
- Don't round full-width sections or bands (`rounded.none` is mandatory).
- Don't underline inline links; the deep teal `#006B8F` color alone carries affordance.
- Don't add arbitrary shadows, glows, or multi-stop gradients.
