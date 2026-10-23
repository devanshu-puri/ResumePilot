import React from "react";
import { clsx } from "clsx";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "dotgrid border border-dashed border-line rounded p-8 text-center flex flex-col items-center justify-center min-h-[220px]",
        className
      )}
    >
      <h3 className="font-display font-medium text-ink text-base tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-ink-2 max-w-sm font-sans">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
