import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FramedPanel } from "@/components/ui/framed-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export default function AppHomePage() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <Eyebrow module="neutral">WORKSPACE</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Your Preparation Hub
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Evidence-grounded next best actions derived from your activity.
        </p>
      </div>

      {/* Hero Framed Panel: Next-Best-Action */}
      <FramedPanel className="space-y-4">
        <Eyebrow module="resume">NEXT-BEST-ACTION</Eyebrow>
        <div>
          <h2 className="text-xl font-display font-medium text-ink">
            Upload your resume to extract verifiable claims
          </h2>
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-1">
            Because you do not have an active resume uploaded yet. Adding your resume allows
            ResumePilot to anchor interview defense questions in your exact source text.
          </p>
        </div>
        <div>
          <Link href="/resume">
            <Button variant="primary">
              <Upload className="w-4 h-4 mr-2" />
              <span>Upload Resume</span>
            </Button>
          </Link>
        </div>
      </FramedPanel>

      {/* Topics / Gaps summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-line rounded p-5 bg-card">
          <Eyebrow module="interview">RECENT SESSIONS</Eyebrow>
          <div className="mt-4">
            <EmptyState
              title="No interview sessions yet"
              description="Once you complete defense or challenge questions, your performance logs will appear here."
            />
          </div>
        </div>

        <div className="border border-line rounded p-5 bg-card">
          <Eyebrow module="library">OPEN GAPS</Eyebrow>
          <div className="mt-4">
            <EmptyState
              title="No open gaps identified"
              description="Gaps are derived when consecutive evaluations indicate low scores on specific topics."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
