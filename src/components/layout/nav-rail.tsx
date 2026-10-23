"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Home,
  FileText,
  MessageSquare,
  BookOpen,
  Zap,
  History,
  Settings,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: "resume" | "interview" | "library" | "neutral";
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/home", icon: Home, module: "neutral" },
  { name: "Resume", href: "/resume", icon: FileText, module: "resume" },
  { name: "Interview", href: "/interview", icon: MessageSquare, module: "interview" },
  { name: "Library", href: "/library", icon: BookOpen, module: "library" },
  { name: "Tech Bites", href: "/tech-bites", icon: Zap, module: "library" },
];

export const FOOT_NAV_ITEMS: NavItem[] = [
  { name: "History", href: "/history", icon: History, module: "neutral" },
  { name: "Settings", href: "/settings", icon: Settings, module: "neutral" },
];

export function NavRail() {
  const pathname = usePathname();

  const renderLink = (item: NavItem) => {
    const isActive = pathname.startsWith(item.href);

    // Active item tick in module hue
    let tickColor = "bg-ink";
    if (item.module === "resume") tickColor = "bg-resume-mark";
    else if (item.module === "interview") tickColor = "bg-interview";
    else if (item.module === "library") tickColor = "bg-library";

    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          "relative flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-colors group",
          isActive
            ? "text-ink font-medium bg-wash/60"
            : "text-ink-2 hover:text-ink hover:bg-wash/40"
        )}
      >
        {/* 2px left tick in module hue for active item */}
        {isActive && (
          <span
            className={clsx(
              "absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r",
              tickColor
            )}
          />
        )}
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="hidden lg:inline">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden sm:flex flex-col justify-between w-14 lg:w-[220px] border-r border-line bg-paper-2 min-h-screen p-3 flex-shrink-0">
      <div className="space-y-6">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 py-1 text-ink no-underline"
        >
          <div className="w-6 h-6 rounded bg-ink text-on-ink flex items-center justify-center font-display font-bold text-xs">
            RP
          </div>
          <span className="hidden lg:inline font-display font-medium text-base tracking-tight">
            ResumePilot
          </span>
        </Link>

        {/* Main Nav */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {MAIN_NAV_ITEMS.map(renderLink)}
        </nav>
      </div>

      {/* Foot Nav */}
      <div className="border-t border-line pt-3 space-y-1" aria-label="Secondary Navigation">
        {FOOT_NAV_ITEMS.map(renderLink)}
      </div>
    </aside>
  );
}
