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
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="sm:hidden flex items-center gap-2 text-ink no-underline font-display font-medium text-sm"
        >
          <div className="w-5 h-5 rounded bg-ink text-on-ink flex items-center justify-center font-display font-bold text-[10px]">
            RP
          </div>
          <span>ResumePilot</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-wash transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          href="/auth/signin"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-wash transition-colors"
          aria-label="User account or sign in"
        >
          <UserIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
