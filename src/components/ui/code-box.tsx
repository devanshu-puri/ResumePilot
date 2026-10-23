import React from "react";
import { clsx } from "clsx";

export interface CodeBoxProps {
  code: string;
  language?: string;
  className?: string;
  banner?: string;
}

export function CodeBox({
  code,
  language,
  className,
  banner = "Reviewed, not executed",
}: CodeBoxProps) {
  return (
    <div
      className={clsx(
        "rounded border border-line bg-wash/30 overflow-hidden text-xs font-mono",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-wash-2/50 border-b border-line text-ink-2">
        <span>{language ? language.toUpperCase() : "CODE"}</span>
        <span className="text-[10px] tracking-wider uppercase bg-wash px-1.5 py-0.5 rounded border border-line-3 text-ink-4">
          {banner}
        </span>
      </div>
      <pre className="p-3 overflow-x-auto text-ink font-mono whitespace-pre leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
