import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oracle Warm Neutral Ladder
        canvas: {
          DEFAULT: "var(--canvas)",
          soft: "var(--canvas-soft)",
          tint: "var(--canvas-tint)",
          warm: "var(--canvas-warm)",
        },
        hairline: "var(--hairline)",
        divider: "var(--divider)",
        "field-border": "var(--field-border)",
        ink: {
          DEFAULT: "var(--ink)",
          deep: "var(--ink-deep)",
          2: "var(--ink-2)",
          4: "var(--ink-4)",
        },
        "disabled-ink": "var(--disabled-ink)",

        // Action Charcoal & On Primary
        primary: {
          DEFAULT: "var(--primary)",
          pressed: "var(--primary-pressed)",
        },
        "on-primary": "var(--on-primary)",

        // Brand & Accents
        "brand-mark": "var(--brand-mark)",
        "accent-gold": {
          DEFAULT: "var(--accent-gold)",
          soft: "var(--accent-gold-soft)",
        },
        "accent-indigo": "var(--accent-indigo)",
        "band-teal": "var(--band-teal)",
        "band-forest": "var(--band-forest)",
        link: "var(--link)",
        "focus-ring": "var(--focus)",

        // Compatibility Aliases with Project Baseline
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        card: "var(--card)",
        wash: "var(--wash)",
        "wash-2": "var(--wash-2)",
        muted: "var(--muted)",
        "on-ink": "var(--on-ink)",
        line: "var(--line)",
        "line-3": "var(--line-3)",
        faint: "var(--faint)",
        hatch: "var(--hatch)",
        separator: "var(--separator)",
        dot: "var(--dot)",

        // Domain Module & Evidence Outcomes
        resume: {
          DEFAULT: "var(--resume)",
          mark: "var(--resume-mark)",
          wash: "var(--resume-wash)",
        },
        interview: {
          DEFAULT: "var(--interview)",
          wash: "var(--interview-wash)",
        },
        library: {
          DEFAULT: "var(--library)",
          wash: "var(--library-wash)",
        },
        strong: {
          DEFAULT: "var(--strong)",
          wash: "var(--strong-wash)",
        },
        partial: {
          DEFAULT: "var(--partial)",
          wash: "var(--partial-wash)",
        },
        weak: {
          DEFAULT: "var(--weak)",
          mark: "var(--weak-mark)",
          wash: "var(--weak-wash)",
        },
      },
      fontFamily: {
        sans: ["var(--sans)", "Inter", "Oracle Sans", "sans-serif"],
        display: ["var(--display)", "Inter", "sans-serif"],
        serif: ["var(--serif)", "Georgia", "serif"],
        "display-serif": ["var(--serif)", "Georgia", "serif"],
        instrument: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--mono)", "monospace"],
        book: ["var(--book)", "Georgia", "serif"],
      },
      borderRadius: {
        none: "0px",
        xs: "var(--radius-xs, 4px)",
        sm: "var(--radius-sm, 6px)",
        DEFAULT: "var(--radius, 8px)",
        md: "var(--radius-md, 8px)",
        lg: "var(--radius-lg, 12px)",
        xl: "var(--radius-xl, 15px)",
        full: "9999px",
      },
      spacing: {
        section: "48px",
        gutter: "72px",
      },
      boxShadow: {
        none: "none",
        flat: "none",
      },
    },
  },
  plugins: [],
};

export default config;
