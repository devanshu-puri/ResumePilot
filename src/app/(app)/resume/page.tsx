import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow module="resume">MODULE 01 · RESUME INTELLIGENCE</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Resume Workspace
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Extract, review, and confirm verifiable claims and skills.
        </p>
      </div>

      <EmptyState
        title="No active resume"
        description="Upload a PDF/DOCX or paste text (≤5 MB). Files are never written to disk and are processed in memory only."
        action={
          <Button variant="primary">
            <Upload className="w-4 h-4 mr-2" />
            <span>Upload Resume</span>
          </Button>
        }
      />
    </div>
  );
}
