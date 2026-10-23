import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
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

    const baseClasses =
      "relative min-h-[44px] inline-flex items-center justify-center overflow-hidden isolate border rounded cursor-pointer transition-colors duration-300 font-display tracking-tight text-[15px]";

    const sizeClasses = {
      sm: "min-h-[36px] px-3 text-xs",
      md: "min-h-[44px] px-5 text-[15px]",
      lg: "min-h-[50px] px-7 text-base",
    }[size];

    const variantClasses = isDark
      ? "bg-ink text-on-ink border-ink hover:bg-ink/90"
      : isDanger
      ? "border-weak text-weak bg-transparent hover:bg-weak-wash"
      : isGhost
      ? "border-transparent bg-transparent text-ink hover:bg-wash"
      : "border-line text-ink bg-paper hover:bg-wash";

    const disabledClasses = disabled
      ? "opacity-45 cursor-not-allowed hover:bg-transparent"
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
