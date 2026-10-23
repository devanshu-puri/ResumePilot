import React from "react";
import Link from "next/link";
import { clsx } from "clsx";

export interface EvidenceChipProps {
  sourceType: "Interview" | "Activity" | "Retest" | string;
  topicName: string;
  ratio: number;
  href?: string;
  className?: string;
}

export function EvidenceChip({
  sourceType,
  topicName,
  ratio,
  href,
  className,
}: EvidenceChipProps) {
  let dotColor = "bg-weak";
  if (ratio >= 0.75) {
    dotColor = "bg-strong";
  } else if (ratio >= 0.4) {
    dotColor = "bg-partial";
  }

  const content = (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono border border-line rounded-sm bg-card text-ink transition-colors hover:border-ink-2",
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColor)} />
      <span>{sourceType}</span>
      <span className="text-ink-4">·</span>
      <span>{topicName}</span>
      <span className="text-ink-4">·</span>
      <span className="font-semibold">{ratio.toFixed(2)}</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
