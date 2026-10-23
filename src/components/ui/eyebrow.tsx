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

/**
 * Oracle Analysis Spec: hero-eyebrow-rule
 * 40 × 4px bar in accent-gold (#f0cc71) sitting directly under the hero headline.
 * The system's deliberate single piece of ornament.
 */
export function HeroEyebrowRule({ className }: { className?: string }) {
  return (
    <div
      className={clsx("w-10 h-1 bg-accent-gold rounded-none my-3 inline-block", className)}
      role="presentation"
      aria-hidden="true"
    />
  );
}
