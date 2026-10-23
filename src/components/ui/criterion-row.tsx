"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScoreBar } from "./score-bar";

export interface CriterionRowProps {
  criterionName: string;
  score?: number | null;
  maxScore?: number;
  feedback?: string;
  evidenceQuote?: string | null;
}

export function CriterionRow({
  criterionName,
  score,
  maxScore = 4,
  feedback,
  evidenceQuote,
}: CriterionRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasQuote = Boolean(evidenceQuote && evidenceQuote.trim().length > 0);

  return (
    <div className="border-b border-line py-3 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-sans font-medium text-ink">
          {hasQuote ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink-2 hover:text-ink transition-colors p-0.5"
              aria-label={isOpen ? "Collapse evidence quote" : "Expand evidence quote"}
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span>{criterionName}</span>
        </div>

        <div className="w-full sm:w-48">
          <ScoreBar score={score} maxScore={maxScore} />
        </div>
      </div>

      {feedback && (
        <p className="mt-1.5 ml-6 text-xs text-ink-2 font-sans">{feedback}</p>
      )}

      {isOpen && hasQuote && (
        <div className="mt-2 ml-6 pl-3 border-l-2 border-interview text-xs font-book italic text-ink bg-interview-wash/20 py-1.5 pr-2">
          &ldquo;{evidenceQuote}&rdquo;
        </div>
      )}
    </div>
  );
}
