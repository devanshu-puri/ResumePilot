import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Check, AlertCircle, Circle, HelpCircle } from "lucide-react";

export type BadgeVariant =
  | "neutral"
  | "strong"
  | "partial"
  | "weak"
  | "notscored"
  | "resume"
  | "interview"
  | "library";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  children,
  className,
  ...props
}: BadgeProps) {
  let icon: React.ReactNode = null;
  let variantClasses = "";

  switch (variant) {
    case "strong":
      icon = <Check className="w-3 h-3 text-strong" />;
      variantClasses = "bg-strong-wash text-strong border-transparent";
      break;
    case "partial":
      icon = <span className="text-[10px] leading-none text-partial">◐</span>;
      variantClasses = "bg-partial-wash text-partial border-transparent";
      break;
    case "weak":
      icon = <AlertCircle className="w-3 h-3 text-weak" />;
      variantClasses = "bg-weak-wash text-weak border-transparent";
      break;
    case "notscored":
      icon = <Circle className="w-2.5 h-2.5 text-ink-2" />;
      variantClasses = "bg-transparent text-ink-2 border border-dashed border-hatch";
      break;
    case "resume":
      variantClasses = "bg-resume-wash text-resume border border-resume-mark/40";
      break;
    case "interview":
      variantClasses = "bg-interview-wash text-interview border border-interview/40";
      break;
    case "library":
      variantClasses = "bg-library-wash text-library border border-library/40";
      break;
    case "neutral":
    default:
      icon = <HelpCircle className="w-3 h-3 text-ink-2" />;
      variantClasses = "bg-wash text-ink-2 border-transparent";
      break;
  }

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-medium rounded-sm border",
          variantClasses,
          className
        )
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
