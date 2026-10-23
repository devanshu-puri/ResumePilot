import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow module="library">MODULE 03 · TECH LIBRARY</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Curated Knowledge & Activities
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Targeted study notes, practice activities, and deterministic checks.
        </p>
      </div>

      <EmptyState
        title="Explore technical topics"
        description="Filter topics by category, review learning objectives, and complete practice activities to address evidenced gaps."
        action={
          <Button variant="primary">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Browse Topics</span>
          </Button>
        }
      />
    </div>
  );
}
