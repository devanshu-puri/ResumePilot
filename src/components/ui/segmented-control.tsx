"use client";

import React from "react";
import { clsx } from "clsx";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const currentIndex = options.findIndex((opt) => opt.value === value);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div
      className={clsx("seg", className)}
      style={
        {
          "--n": options.length,
          "--i": activeIndex,
        } as React.CSSProperties
      }
      role="tablist"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
