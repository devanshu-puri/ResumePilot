import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "inverse";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDark = variant === "primary";
    const isGhost = variant === "ghost";
    const isDanger = variant === "danger";
    const isInverse = variant === "inverse";

    // Oracle Analysis Spec: rounded.xs (4px), label typography (14px, 500 weight, 0 tracking), 10px 16px padding
    const baseClasses =
      "relative inline-flex items-center justify-center isolate rounded-xs transition-colors duration-150 font-sans font-medium tracking-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer select-none";

    const sizeClasses = {
      sm: "min-h-[32px] px-3 py-1 text-xs",
      md: "min-h-[38px] px-4 py-2.5 text-sm", // 10px 16px padding per Oracle spec
      lg: "min-h-[44px] px-6 py-3 text-base",
    }[size];

    const variantClasses = isDark
      ? "bg-primary text-on-primary border border-transparent hover:bg-primary-pressed active:bg-primary-pressed"
      : isDanger
      ? "border border-weak text-weak bg-transparent hover:bg-weak-wash"
      : isGhost
      ? "border border-transparent bg-transparent text-ink hover:bg-ink/8"
      : isInverse
      ? "bg-canvas text-ink border border-transparent hover:bg-canvas-soft"
      : "border border-ink text-ink bg-transparent hover:bg-ink/5";

    const disabledClasses = disabled
      ? "bg-canvas-soft text-disabled-ink border-hairline opacity-60 cursor-not-allowed hover:bg-canvas-soft hover:text-disabled-ink active:bg-canvas-soft pointer-events-none"
      : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(
          clsx(
            baseClasses,
            sizeClasses,
            variantClasses,
            disabledClasses,
            className
          )
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
