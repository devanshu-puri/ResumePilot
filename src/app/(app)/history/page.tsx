import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow module="neutral">SESSION HISTORY</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Evaluation History
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Historical records of all completed interview questions and activity attempts.
        </p>
      </div>

      <EmptyState
        title="No historical sessions"
        description="Your past responses and criterion breakdowns will be preserved here."
      />
    </div>
  );
}
