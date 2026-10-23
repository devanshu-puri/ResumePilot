import React from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ShieldCheck, ArrowLeft, Trash2, Download, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink p-6 sm:p-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-2 hover:text-ink mb-6 no-underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <Eyebrow module="neutral">SECURITY & PRIVACY PRINCIPLES</Eyebrow>

      <h1 className="mt-3 text-3xl font-display font-medium text-ink">
        Privacy & Data Retention Guarantee
      </h1>

      <p className="mt-2 text-sm text-ink-2 font-sans">
        ResumePilot is built on strict data minimization and ownership principles.
        Your resume and answers remain exclusively yours.
      </p>

      <div className="mt-8 space-y-6">
        <div className="p-5 rounded border border-line bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-strong-wash text-strong">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-display font-medium text-lg text-ink">
              1. Ephemeral File Handling
            </h2>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-ink-2 leading-relaxed">
            Uploaded resume files (PDF / DOCX) are processed in memory only. They are
            <strong> never written to disk or object storage</strong>, and the file buffer
            is immediately discarded once text extraction completes.
          </p>
        </div>

        <div className="p-5 rounded border border-line bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-interview-wash text-interview">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-display font-medium text-lg text-ink">
              2. Redacting Logging Architecture
            </h2>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-ink-2 leading-relaxed">
            Our application logger enforces a strict redaction policy (I-08).
            Log records never contain user resume text, extracted claims, or interview answers.
            Only operational metadata (latency, status codes, task identifiers) are recorded.
          </p>
        </div>

        <div className="p-5 rounded border border-line bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-resume-wash text-resume">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="font-display font-medium text-lg text-ink">
              3. Complete Data Deletion & Export
            </h2>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-ink-2 leading-relaxed">
            You retain absolute control over your records (ACC-1). You can delete your resume,
            purge all interview responses and evidence logs, or export your full dataset as JSON
            at any time directly from the Settings page.
          </p>
        </div>
      </div>
    </div>
  );
}
