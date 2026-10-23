"use client";

import React, { useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function SpotlightCard({
  children,
  className,
  glowColor,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--card-mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--card-mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={twMerge(
        clsx(
          "spotlight-card group relative overflow-hidden transition-all duration-300",
          className
        )
      )}
      {...props}
    >
      {/* Interactive Ambient Follow Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(460px circle at var(--card-mouse-x, -460px) var(--card-mouse-y, -460px), ${
            glowColor || "rgba(107, 92, 231, 0.08)"
          }, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
