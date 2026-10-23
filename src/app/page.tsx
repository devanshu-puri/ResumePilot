import React from "react";
import Link from "next/link";
import { Eyebrow, HeroEyebrowRule } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BookOpen, MessageSquare, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-hairline max-w-6xl mx-auto w-full bg-canvas">
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
            className="text-ink-2 hover:text-ink px-2 py-1 rounded-xs"
          >
            UI System
          </Link>
          <Link
            href="/privacy"
            className="text-ink-2 hover:text-ink px-2 py-1 rounded-xs"
          >
            Privacy
          </Link>
          <Link
            href="/auth/signin"
            className="px-3 py-1.5 rounded-xs border border-hairline hover:border-ink text-ink transition-colors bg-canvas-soft"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        <Eyebrow module="neutral">THE EVIDENCE-BACKED INTERVIEW PREPARATION SYSTEM</Eyebrow>

        <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-ink tracking-normal max-w-3xl leading-[1.18]">
          Know what your resume invites an interviewer to ask.
        </h1>

        {/* Oracle Single Gold Rule: 40 x 4px beneath the hero headline */}
        <HeroEyebrowRule className="my-5" />

        <p className="mt-2 text-base sm:text-lg text-ink-2 max-w-2xl font-sans leading-relaxed">
          Practise defending your real claims. Receive explainable criterion-level
          evaluations. Turn evidenced weaknesses into structured learning.
        </p>

        {/* Action Buttons: Action Charcoal #312D2A at 4px radius */}
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

        {/* Signature Evidence Thread Illustration */}
        <div className="mt-16 w-full max-w-xl p-6 rounded-md border border-hairline bg-canvas-soft">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-4 mb-4">
            The Closed Evidence Loop
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
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-resume bg-resume-wash flex items-center justify-center text-resume">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="mt-2 text-xs font-mono font-medium text-resume">
                  Resume Claims
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-interview bg-interview-wash flex items-center justify-center text-interview">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="mt-2 text-xs font-mono font-medium text-interview">
                  Adaptive Defense
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-library bg-library-wash flex items-center justify-center text-library">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="mt-2 text-xs font-mono font-medium text-library">
                  Targeted Learning
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-ink-2 font-sans">
            Evaluations write to an append-only evidence ledger. Gaps are derived by versioned rules, leading directly to targeted practice activities and comparable retests.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-6 text-center text-xs text-ink-4 font-mono bg-canvas">
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
