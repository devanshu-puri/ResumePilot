import React from "react";
import { clsx } from "clsx";

export interface FramedPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function FramedPanel({
  children,
  className,
  ...props
}: FramedPanelProps) {
  return (
    <div className={clsx("framed p-6", className)} {...props}>
      {children}
    </div>
  );
}
