import React from "react";
import { clsx } from "clsx";

export interface GapMarkerProps {
  version?: string;
  className?: string;
}

export function GapMarker({ version = "v1", className }: GapMarkerProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-mono text-weak font-medium",
        className
      )}
      title={`Open gap derived by rule ${version}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-weak animate-pulse" />
      <span>Open gap</span>
      <span className="text-[10px] text-ink-4 px-1 border border-line rounded">
        {version}
      </span>
    </span>
  );
}
