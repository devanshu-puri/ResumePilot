"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Home,
  FileText,
  MessageSquare,
  Target,
  ShieldAlert,
  Zap,
  History,
  Settings,
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
  { name: "Skill Drills", href: "/drills", icon: Target, module: "interview" },
  { name: "Project Panel", href: "/projects", icon: ShieldAlert, module: "interview" },
  { name: "Tech Bites", href: "/tech-bites", icon: Zap, module: "library" },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/home", icon: Home, module: "neutral" },
  { name: "Resume", href: "/resume", icon: FileText, module: "resume" },
  { name: "Interview", href: "/interview", icon: MessageSquare, module: "interview" },
  { name: "Skill Drills", href: "/drills", icon: Target, module: "interview" },
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

    // Active item tick in module hue or accent gold
    let tickColor = "bg-primary";
    if (item.module === "resume") tickColor = "bg-resume-mark";
    else if (item.module === "interview") tickColor = "bg-accent-gold";
    else if (item.module === "library") tickColor = "bg-library";

    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          "relative flex items-center gap-3 px-3 py-2 rounded-xs text-sm font-sans transition-colors group",
          isActive
            ? "text-ink font-semibold bg-canvas border border-hairline"
            : "text-ink-2 hover:text-ink hover:bg-canvas-tint/70"
        )}
      >
        {/* 2px left tick for active item */}
        {isActive && (
          <span
            className={clsx(
              "absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r-xs",
              tickColor
            )}
          />
        )}
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="hidden lg:inline font-sans">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden sm:flex flex-col justify-between w-14 lg:w-[220px] border-r border-hairline bg-canvas-soft min-h-screen p-3 flex-shrink-0">
      <div className="space-y-6">
        {/* Oracle Wordmark: brand red #c74634 exclusively on the wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 py-1 text-ink no-underline group"
        >
          <div className="w-6 h-6 rounded-xs bg-brand-mark text-white flex items-center justify-center font-serif font-bold text-xs tracking-tight shadow-none">
            RP
          </div>
          <span className="hidden lg:inline font-serif font-semibold text-lg tracking-normal text-brand-mark">
            ResumePilot
          </span>
        </Link>

        {/* Main Nav */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {MAIN_NAV_ITEMS.map(renderLink)}
        </nav>
      </div>

      {/* Foot Nav */}
      <div className="border-t border-hairline pt-3 space-y-1" aria-label="Secondary Navigation">
        {FOOT_NAV_ITEMS.map(renderLink)}
      </div>
    </aside>
  );
}
