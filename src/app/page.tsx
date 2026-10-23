import React from "react";
import Link from "next/link";
import { Eyebrow, HeroEyebrowRule } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Reveal } from "@/components/ui/reveal";
import {
  ArrowRight,
  Shield,
  BookOpen,
  MessageSquare,
  FileText,
  Target,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-ink flex flex-col justify-between selection:bg-accent-indigo selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-hairline max-w-6xl mx-auto w-full bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xs bg-brand-mark text-white flex items-center justify-center font-serif font-bold text-xs shadow-none">
            RP
          </div>
          <span className="font-serif font-semibold text-lg tracking-normal text-brand-mark">
            ResumePilot
          </span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-sans">
          <Link
            href="/dev/ui"
            className="text-ink-2 hover:text-ink px-2 py-1 rounded-xs transition-colors"
          >
            UI System
          </Link>
          <Link
            href="/privacy"
            className="text-ink-2 hover:text-ink px-2 py-1 rounded-xs transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/auth/signin"
            className="px-3 py-1.5 rounded-xs border border-hairline hover:border-ink text-ink transition-colors bg-canvas-soft/90"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        <Reveal direction="up" delay={50}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-canvas-soft/80 backdrop-blur-sm text-xs font-mono text-ink-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
            <span>THE EVIDENCE-BACKED INTERVIEW SYSTEM</span>
          </div>
        </Reveal>

        <Reveal direction="up" delay={120}>
          <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-sans font-medium text-ink tracking-tight max-w-4xl leading-[1.08]">
            Know what your resume invites an interviewer to{" "}
            <span className="font-serif italic text-accent-indigo">ask.</span>
          </h1>
        </Reveal>

        <Reveal direction="up" delay={180}>
          {/* Oracle Gold Rule: 40 x 4px beneath the hero headline */}
          <HeroEyebrowRule className="my-5" />
        </Reveal>

        <Reveal direction="up" delay={220}>
          <p className="text-base sm:text-lg text-ink-2 max-w-2xl font-sans leading-relaxed">
            Practise defending your real claims. Receive explainable criterion-level
            evaluations. Turn evidenced weaknesses into structured learning.
          </p>
        </Reveal>

        {/* Action Buttons: Action Charcoal #312D2A at 4px radius */}
        <Reveal direction="up" delay={280}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/home">
              <Button variant="primary" size="lg" className="min-w-[180px]">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="secondary" size="lg">
                <Shield className="w-4 h-4 mr-1 text-ink-2" />
                <span>Zero-Retention Privacy</span>
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Signature Evidence Thread Illustration with Spotlight Glow */}
        <Reveal direction="up" delay={340} className="w-full max-w-2xl mt-14">
          <SpotlightCard className="p-6 sm:p-8 rounded-lg border-hairline bg-canvas/90 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-4">
                The Closed Evidence Loop
              </span>
              <span className="text-[11px] font-mono text-accent-indigo uppercase tracking-wider font-medium">
                Append-Only Ledger
              </span>
            </div>

            <div className="relative py-4">
              {/* SVG Connecting Thread */}
              <svg
                className="w-full h-8 overflow-visible"
                viewBox="0 0 400 30"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line x1="50" y1="15" x2="350" y2="15" className="thread-path" />
                <line x1="50" y1="15" x2="350" y2="15" className="pulse" />
              </svg>

              <div className="flex justify-between items-center relative -mt-7 px-2">
                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-full border border-resume bg-resume-wash flex items-center justify-center text-resume transition-transform group-hover:scale-110">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="mt-2 text-xs font-mono font-medium text-resume">
                    Resume Claims
                  </span>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-full border border-interview bg-interview-wash flex items-center justify-center text-interview transition-transform group-hover:scale-110">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="mt-2 text-xs font-mono font-medium text-interview">
                    Adaptive Defense
                  </span>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-9 h-9 rounded-full border border-library bg-library-wash flex items-center justify-center text-library transition-transform group-hover:scale-110">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="mt-2 text-xs font-mono font-medium text-library">
                    Targeted Learning
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-ink-2 font-sans leading-relaxed">
              Evaluations write directly to your immutable evidence ledger. Gaps are derived by versioned rules, leading directly to targeted practice activities and comparable retests.
            </p>
          </SpotlightCard>
        </Reveal>

        {/* Three Core Modules Showcase */}
        <section className="mt-20 w-full max-w-4xl text-left space-y-6">
          <Reveal direction="up" delay={100}>
            <div className="text-center sm:text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-4">
                Architecture & Modules
              </span>
              <h2 className="text-2xl sm:text-4xl font-sans font-medium text-ink mt-1">
                Three Modules.{" "}
                <span className="font-serif italic text-accent-indigo">One System.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Reveal direction="up" delay={150}>
              <SpotlightCard className="p-5 h-full rounded-md border-hairline bg-canvas/80 backdrop-blur-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xs bg-resume-wash text-resume flex items-center justify-center border border-resume/30">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-sans font-semibold text-base text-ink">
                    Resume Intelligence
                  </h3>
                  <p className="text-xs text-ink-2 font-sans leading-relaxed">
                    Exact character offset tracking, user confirmation workflow, and Gemini AI Studio multimodal document extraction with zero fabricated claims.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono text-ink-4">
                  <span>Module 01</span>
                  <span className="text-resume font-medium">Deterministic</span>
                </div>
              </SpotlightCard>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <SpotlightCard className="p-5 h-full rounded-md border-hairline bg-canvas/80 backdrop-blur-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xs bg-interview-wash text-interview flex items-center justify-center border border-interview/30">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-sans font-semibold text-base text-ink">
                    Drills & Project Defense
                  </h3>
                  <p className="text-xs text-ink-2 font-sans leading-relaxed">
                    Rapid adaptive questions with confidence calibration (Certain / Unsure / Guessing) and 10 senior STAR architectural defense scenarios.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono text-ink-4">
                  <span>Module 02</span>
                  <span className="text-interview font-medium">Calibrated</span>
                </div>
              </SpotlightCard>
            </Reveal>

            <Reveal direction="up" delay={250}>
              <SpotlightCard className="p-5 h-full rounded-md border-hairline bg-canvas/80 backdrop-blur-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-xs bg-library-wash text-library flex items-center justify-center border border-library/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-sans font-semibold text-base text-ink">
                    Tech Bites (15 Min)
                  </h3>
                  <p className="text-xs text-ink-2 font-sans leading-relaxed">
                    Interactive 5-stage architectural mental models: Why → Concept Map → Flow Visualizer → Code Workbench → Active Recall.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono text-ink-4">
                  <span>Module 03</span>
                  <span className="text-library font-medium">15 Minutes</span>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-6 text-center text-xs text-ink-4 font-mono bg-canvas/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ResumePilot · Built for Hacktoberfest 2026</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy & Retention
            </Link>
            <Link href="/dev/ui" className="hover:text-ink transition-colors">
              UI System
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
