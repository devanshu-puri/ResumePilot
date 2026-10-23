import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ScoreBarProps {
  score?: number | null;
  maxScore?: number;
  className?: string;
  showText?: boolean;
}

export function ScoreBar({
  score,
  maxScore = 4,
  className,
  showText = true,
}: ScoreBarProps) {
  const isScored = score !== null && score !== undefined && maxScore > 0;
  const ratio = isScored ? Math.min(Math.max(score / maxScore, 0), 1) : 0;

  // Bands from DESIGN.md: strong >= 0.75, partial 0.40 - 0.74, weak < 0.40
  let bandClass = "bg-weak";
  if (ratio >= 0.75) {
    bandClass = "bg-strong";
  } else if (ratio >= 0.4) {
    bandClass = "bg-partial";
  }

  return (
    <div className={twMerge(clsx("flex items-center gap-3", className))}>
      {showText && (
        <span className="font-mono text-xs text-ink min-w-[3rem]">
          {isScored ? `${score} / ${maxScore}` : "Not scored"}
        </span>
      )}
      <div className="relative flex-1 h-1 bg-wash-2 rounded-full overflow-hidden">
        {isScored ? (
          <div
            className={clsx("h-full transition-all duration-300", bandClass)}
            style={{ width: `${ratio * 100}%` }}
          />
        ) : (
          <div className="h-full w-full hatch" />
        )}
      </div>
    </div>
  );
}
