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
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        card: "var(--card)",
        wash: "var(--wash)",
        "wash-2": "var(--wash-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-4": "var(--ink-4)",
        muted: "var(--muted)",
        "on-ink": "var(--on-ink)",
        line: "var(--line)",
        "line-3": "var(--line-3)",
        faint: "var(--faint)",
        hatch: "var(--hatch)",
        separator: "var(--separator)",
        dot: "var(--dot)",

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
        sans: ["var(--sans)", "sans-serif"],
        display: ["var(--display)", "sans-serif"],
        mono: ["var(--mono)", "monospace"],
        book: ["var(--book)", "serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
