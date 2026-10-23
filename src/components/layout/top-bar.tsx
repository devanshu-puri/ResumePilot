"use client";

import React from "react";
import Link from "next/link";
import { Moon, Sun, User as UserIcon } from "lucide-react";

export function TopBar() {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="sm:hidden flex items-center gap-2 text-ink no-underline font-serif font-normal text-sm"
        >
          <div className="w-5 h-5 rounded-xs bg-brand-mark text-white flex items-center justify-center font-serif font-bold text-[10px]">
            RP
          </div>
          <span className="font-serif font-semibold text-sm tracking-normal text-brand-mark">
            ResumePilot
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xs text-ink-2 hover:text-ink hover:bg-canvas-tint transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          href="/auth/signin"
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xs text-ink-2 hover:text-ink hover:bg-canvas-tint transition-colors"
          aria-label="User account or sign in"
        >
          <UserIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
