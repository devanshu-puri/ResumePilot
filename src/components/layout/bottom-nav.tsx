"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { MOBILE_NAV_ITEMS, NavItem } from "./nav-rail";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas-soft border-t border-hairline flex items-center justify-around h-14 px-2"
      aria-label="Mobile Navigation"
    >
      {MOBILE_NAV_ITEMS.map((item: NavItem) => {
        const isActive = pathname.startsWith(item.href);

        let tickColor = "bg-primary";
        if (item.module === "resume") tickColor = "bg-resume-mark";
        else if (item.module === "interview") tickColor = "bg-accent-gold";
        else if (item.module === "library") tickColor = "bg-library";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 text-xs transition-colors",
              isActive ? "text-ink font-semibold" : "text-ink-2 hover:text-ink"
            )}
          >
            {/* 2px top tick in module hue */}
            {isActive && (
              <span
                className={clsx(
                  "absolute top-0 left-2 right-2 h-[2.5px] rounded-b-xs",
                  tickColor
                )}
              />
            )}
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-sans">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
