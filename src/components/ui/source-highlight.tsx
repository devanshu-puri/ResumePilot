import React from "react";
import { clsx } from "clsx";

export interface SourceHighlightProps {
  status?: "selected" | "confirmed" | "unconfirmed" | "excluded";
  children: React.ReactNode;
  className?: string;
}

export function SourceHighlight({
  status = "confirmed",
  children,
  className,
}: SourceHighlightProps) {
  let styleClasses = "font-book text-ink";

  switch (status) {
    case "selected":
      styleClasses = "font-book text-ink bg-resume-wash underline decoration-resume-mark decoration-2";
      break;
    case "confirmed":
      styleClasses = "font-book text-ink underline decoration-resume-mark/60";
      break;
    case "unconfirmed":
      styleClasses = "font-book text-ink underline decoration-dashed decoration-resume-mark/40";
      break;
    case "excluded":
      styleClasses = "font-book text-ink-4 line-through decoration-ink-4";
      break;
  }

  return <span className={clsx(styleClasses, className)}>{children}</span>;
}
