"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getAllLessons } from "@/content/tech-bites/lessons";
import { LessonPath } from "@/content/tech-bites/lesson-schema";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Clock,
  Zap,
  Search,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { clsx } from "clsx";

const PATH_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All Paths" },
  { id: "backend", label: "Backend" },
  { id: "ai", label: "AI & LLMs" },
  { id: "frontend", label: "Frontend" },
  { id: "devops", label: "DevOps & Cloud" },
  { id: "foundations", label: "Foundations" },
];

export default function TechBitesHubPage() {
  const [selectedPath, setSelectedPath] = useState<string>("all");
  const [search, setSearch] = useState("");

  const allLessons = getAllLessons();

  const filteredLessons = allLessons.filter((lesson) => {
    const matchesPath =
      selectedPath === "all" || lesson.paths.includes(selectedPath as LessonPath);
    const matchesSearch =
      !search ||
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      lesson.outcome.toLowerCase().includes(search.toLowerCase()) ||
      lesson.paths.some((p) => p.toLowerCase().includes(search.toLowerCase()));

    return matchesPath && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-4">
        <Eyebrow module="library">MODULE 03 · TECH BITES (LEARN IN 15 MINUTES)</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          15-Minute Architectural Mental Models
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
          Go from unfamiliar to a rock-solid mental model through 5 interactive stages: Why → Mental Model → See It → Try It → Active Recall.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded border border-line bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Path Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PATH_TABS.map((tab) => {
            const isActive = selectedPath === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPath(tab.id)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-sans rounded border transition-colors",
                  isActive
                    ? "bg-library-wash text-library border-library/40 font-medium"
                    : "border-line text-ink-2 hover:text-ink hover:bg-wash/40"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-4" />
          <input
            type="text"
            placeholder="Search 15-min lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <EmptyState
          title="No lessons match your search"
          description="Try selecting 'All Paths' or clearing your search term."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedPath("all");
                setSearch("");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-6 rounded border border-line bg-card flex flex-col justify-between space-y-5 hover:border-ink-2 transition-colors relative group"
            >
              <div className="space-y-3.5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="library">15 MIN</Badge>
                    <span className="text-[11px] font-mono text-ink-4">
                      5 STAGES
                    </span>
                  </div>
                  <Badge variant="neutral">+{lesson.xpAward ?? 50} XP</Badge>
                </div>

                {/* Title */}
                <h3 className="font-display font-medium text-lg text-ink group-hover:text-library transition-colors">
                  {lesson.title}
                </h3>

                {/* Outcome */}
                <p className="text-xs text-ink-2 font-sans leading-relaxed">
                  {lesson.outcome}
                </p>

                {/* Paths and prerequisites */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lesson.paths.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-wash border border-line text-ink-2"
                    >
                      {p}
                    </span>
                  ))}
                  {lesson.prerequisites.length > 0 && (
                    <span className="text-[10px] font-mono text-ink-4 self-center ml-1">
                      Req: {lesson.prerequisites.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <span className="text-[11px] font-mono text-ink-4">
                  Why · Model · Code · Scenario · Recall
                </span>
                <Link href={`/tech-bites/${lesson.id}`}>
                  <Button size="sm" variant="primary">
                    <span>Start Bite</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
