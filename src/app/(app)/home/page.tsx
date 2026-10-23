"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FramedPanel } from "@/components/ui/framed-panel";
import { Button } from "@/components/ui/button";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { GapMarker } from "@/components/ui/gap-marker";
import { EmptyState } from "@/components/ui/empty-state";
import { computeNextBestAction, NextBestActionOutput } from "@/modules/evidence/domain/next-best-action";
import { computeGaps, DerivedGap } from "@/modules/evidence/domain/gap-rules";
import { ArrowRight, Play, Target, FileText, CheckCircle2 } from "lucide-react";

export default function AppHomePage() {
  const [nba, setNba] = useState<NextBestActionOutput>({
    actionType: "upload_resume",
    title: "Upload Your Resume to Begin",
    description: "Upload a PDF, DOCX, or paste text to extract verifiable technical claims and generate defense questions.",
    because: "Because no active resume has been uploaded to your workspace yet.",
    href: "/resume",
    module: "resume",
    buttonLabel: "Upload Resume",
  });
  const [gaps, setGaps] = useState<DerivedGap[]>([]);
  const [hasResume, setHasResume] = useState(false);
  const [claimsCount, setClaimsCount] = useState(0);

  useEffect(() => {
    // 1. Fetch active resume
    fetch("/api/resumes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.resume) {
          setHasResume(true);
          const unreviewed = data.resume.claims.filter((c: any) => !c.userConfirmed && !c.excluded).length;
          const confirmed = data.resume.claims.filter((c: any) => c.userConfirmed && !c.excluded).length;
          setClaimsCount(confirmed);

          const computedNba = computeNextBestAction({
            hasResume: true,
            unreviewedClaimsCount: unreviewed,
            confirmedClaimsCount: confirmed,
            openGaps: [],
          });
          setNba(computedNba);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <Eyebrow module="neutral">WORKSPACE</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Your Preparation Hub
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
          Deterministic guidance grounded in your verifiable performance records.
        </p>
      </div>

      {/* Hero Framed Panel: Next-Best-Action (Corner Ticks) */}
      <FramedPanel className="space-y-4">
        <div className="flex items-center justify-between">
          <Eyebrow module={nba.module}>NEXT-BEST-ACTION</Eyebrow>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-4">
            Deterministic Guidance
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-ink">
            {nba.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-1 leading-relaxed">
            {nba.description}
          </p>
        </div>

        {/* Real record justification (Invariant I-01, PRD EVD-7) */}
        <div className="p-3 rounded border border-line bg-wash/40 font-mono text-xs text-ink-2">
          <span className="text-ink font-medium">Reason: </span>
          <span>{nba.because}</span>
        </div>

        <div className="pt-2">
          <Link href={nba.href}>
            <Button variant="primary">
              <span>{nba.buttonLabel}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </FramedPanel>

      {/* Dual Summary Panels: Open Gaps & Technical Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open Gaps Card */}
        <div className="p-5 rounded border border-line bg-card space-y-4">
          <div className="flex items-center justify-between">
            <Eyebrow module="library">OPEN SKILL GAPS</Eyebrow>
            {gaps.length > 0 && <GapMarker version="v1" />}
          </div>

          {gaps.length === 0 ? (
            <EmptyState
              title="No open gaps identified"
              description="An open gap is derived only when consecutive interview evaluations score below 0.60 on a topic (rule v1)."
            />
          ) : (
            <div className="space-y-3">
              {gaps.map((g) => (
                <div key={g.topicId} className="p-3 rounded border border-line bg-paper flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-ink">{g.topicId}</span>
                    <div className="flex items-center gap-1.5">
                      <EvidenceChip
                        sourceType="Interview"
                        topicName={g.topicId}
                        ratio={g.latestRatios[0]}
                        href={`/drills?skill=${g.topicId}`}
                      />
                    </div>
                  </div>
                  <Link href={`/drills?skill=${g.topicId}`}>
                    <Button size="sm" variant="secondary">
                      Practice Drill
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workspace Quick Links Card */}
        <div className="p-5 rounded border border-line bg-card space-y-4">
          <Eyebrow module="interview">PREPARATION SHORTCUTS</Eyebrow>

          <div className="space-y-2.5">
            <Link
              href="/resume"
              className="flex items-center justify-between p-3 rounded border border-line bg-paper hover:border-ink transition-colors no-underline text-ink"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-resume" />
                <div>
                  <span className="text-sm font-medium block">Resume Intelligence</span>
                  <span className="text-xs text-ink-2">
                    {hasResume ? `${claimsCount} confirmed claims` : "No resume uploaded"}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4" />
            </Link>

            <Link
              href="/interview"
              className="flex items-center justify-between p-3 rounded border border-line bg-paper hover:border-ink transition-colors no-underline text-ink"
            >
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 text-interview" />
                <div>
                  <span className="text-sm font-medium block">Interview Practice Lab</span>
                  <span className="text-xs text-ink-2">Adaptive technical defense</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4" />
            </Link>

            <Link
              href="/drills"
              className="flex items-center justify-between p-3 rounded border border-line bg-paper hover:border-ink transition-colors no-underline text-ink"
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-interview" />
                <div>
                  <span className="text-sm font-medium block">Skill Drills Runner</span>
                  <span className="text-xs text-ink-2">Adaptive questions & confidence calibration</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
