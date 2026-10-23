import React from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm border border-line bg-card p-6 sm:p-8 rounded shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-2 hover:text-ink mb-6 no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        <div>
          <Eyebrow module="neutral">AUTHENTICATION</Eyebrow>
          <h1 className="mt-3 text-2xl font-display font-medium text-ink">
            Sign In to ResumePilot
          </h1>
          <p className="mt-1 text-xs text-ink-2 font-sans">
            Private, evidence-backed mock interviews and skill gaps.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-ink-2 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="candidate@university.edu"
              defaultValue="candidate@example.com"
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink"
            />
          </div>

          <Link href="/home" className="block w-full no-underline">
            <Button variant="primary" className="w-full">
              <UserCheck className="w-4 h-4 mr-1.5" />
              <span>Continue to Workspace</span>
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-line text-center text-xs text-ink-4 font-mono">
          Single provider · Private by default
        </div>
      </div>
    </div>
  );
}
