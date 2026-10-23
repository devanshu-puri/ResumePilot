import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow module="interview">MODULE 02 · INTERVIEW LAB</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Interview Practice Sessions
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          One engine supporting defense, challenge, and mock modes.
        </p>
      </div>

      <EmptyState
        title="No active session"
        description="Select confirmed claims from your resume to begin a defense session, or try a conceptual topic challenge."
        action={
          <Button variant="primary">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            <span>New Practice Session</span>
          </Button>
        }
      />
    </div>
  );
}
