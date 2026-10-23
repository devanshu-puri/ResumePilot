import React from "react";
import { clsx } from "clsx";

export interface EyebrowProps {
  module?: "resume" | "interview" | "library" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({
  module = "neutral",
  children,
  className,
}: EyebrowProps) {
  const moduleClass =
    module === "resume"
      ? "module-resume"
      : module === "interview"
      ? "module-interview"
      : module === "library"
      ? "module-library"
      : "";

  return (
    <div className={clsx("eyebrow", moduleClass, className)}>
      {children}
    </div>
  );
}
