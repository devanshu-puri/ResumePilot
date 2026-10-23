"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
} from "lucide-react";
import { QuickQuizzesView } from "@/components/library/quick-quizzes-view";
import { FlashcardsView } from "@/components/library/flashcards-view";

interface Activity {
  id: string;
  activityType: "knowledge_check" | "short_answer";
  title: string;
  instructions: string;
  contentPayload: any;
  completionPolicy: { minRatio: number };
}

interface Resource {
  slug: string;
  title: string;
  description: string;
  resourceType: string;
  canonicalUrl: string;
  attribution: string;
  internalNotes: string;
  difficulty: string;
  estimatedMinutes: number;
  topicSlugs: string[];
  objectives: { topicSlug: string; description: string }[];
  activities: Activity[];
  userProgress?: string;
  isSaved?: boolean;
}

export default function LibraryPage() {
  const [libraryTab, setLibraryTab] = useState<"quizzes" | "flashcards" | "resources">("quizzes");
  const [activeFlashcardDeckId, setActiveFlashcardDeckId] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [facets, setFacets] = useState<{ topics: string[]; types: string[]; difficulties: string[] }>({
    topics: [],
    types: [],
    difficulties: [],
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [savedOnly, setSavedOnly] = useState(false);

  // Active Practice Activity State
  const [activeActivity, setActiveActivity] = useState<{
    resource: Resource;
    activity: Activity;
  } | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [shortAnswerText, setShortAnswerText] = useState("");
  const [attemptResult, setAttemptResult] = useState<any>(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Load resources
  const fetchResources = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTopic) params.set("topicSlug", selectedTopic);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (savedOnly) params.set("savedOnly", "true");

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
        setFacets(data.facets);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [search, selectedTopic, selectedDifficulty, savedOnly]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Toggle bookmark / save
  const handleToggleSave = async (slug: string) => {
    try {
      const res = await fetch(`/api/resources/${slug}/save`, { method: "POST" });
      if (res.ok) {
        fetchResources();
      }
    } catch {
      // Ignored
    }
  };

  // Submit Practice Attempt
  const handleSubmitAttempt = async () => {
    if (!activeActivity) return;
    setSubmittingAttempt(true);

    try {
      const payload: any = {};
      if (activeActivity.activity.activityType === "knowledge_check") {
        payload.selectedOptions = selectedAnswers;
      } else {
        payload.answerText = shortAnswerText;
      }

      const res = await fetch(`/api/activities/${activeActivity.activity.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responsePayload: payload }),
      });

      if (res.ok) {
        const data = await res.json();
        setAttemptResult(data.attempt);
        fetchResources();
      }
    } catch {
      // Ignored
    } finally {
      setSubmittingAttempt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Eyebrow module="library">MODULE 03 · TECH LIBRARY & PRACTICE STUDIO</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
            Technical Library & Practice Activities
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            Curated architectural guides with deterministic knowledge checks and rubric practice.
          </p>
        </div>

        <Link href="/tech-bites">
          <Button size="sm" variant="secondary" className="border-library/40 bg-library-wash text-library hover:bg-library-wash/80">
            <Zap className="w-4 h-4 mr-1.5 text-library" />
            <span>Launch 15-Min Tech Bites</span>
          </Button>
        </Link>
      </div>

      {/* Tech Bites Spotlight Banner */}
      <div className="p-4 sm:p-5 rounded border border-library/30 bg-library-wash/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="library">NEW FEATURE</Badge>
            <span className="text-xs font-mono font-medium text-ink">
              15-Minute Architectural Mental Models
            </span>
          </div>
          <p className="text-xs text-ink-2 font-sans max-w-xl">
            Want fast, structured learning? Complete 5-stage interactive bites covering Cache-Aside, RAG pipelines, and database indexing with active recall XP rewards.
          </p>
        </div>
        <Link href="/tech-bites" className="flex-shrink-0">
          <Button size="sm" variant="primary">
            <span>Explore Tech Bites</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Mode Selector Tabs (Quick Quizzes vs Flashcards vs Curated Guides) */}
      <div className="flex border-b border-line gap-6 pt-2">
        <button
          type="button"
          onClick={() => setLibraryTab("quizzes")}
          className={`pb-3 text-sm font-sans font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            libraryTab === "quizzes"
              ? "border-library text-ink font-semibold"
              : "border-transparent text-ink-2 hover:text-ink"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-library" />
          <span>Quick Quizzes (MCQs)</span>
        </button>

        <button
          type="button"
          onClick={() => setLibraryTab("flashcards")}
          className={`pb-3 text-sm font-sans font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            libraryTab === "flashcards"
              ? "border-library text-ink font-semibold"
              : "border-transparent text-ink-2 hover:text-ink"
          }`}
        >
          <Sparkles className="w-4 h-4 text-library" />
          <span>Revision Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => setLibraryTab("resources")}
          className={`pb-3 text-sm font-sans font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            libraryTab === "resources"
              ? "border-library text-ink font-semibold"
              : "border-transparent text-ink-2 hover:text-ink"
          }`}
        >
          <BookOpen className="w-4 h-4 text-library" />
          <span>Curated Architectural Guides</span>
        </button>
      </div>

      {/* Tab 1: Quick Quizzes (MCQs) */}
      {libraryTab === "quizzes" && (
        <QuickQuizzesView
          onOpenFlashcardDeck={(deckId) => {
            setActiveFlashcardDeckId(deckId);
            setLibraryTab("flashcards");
          }}
        />
      )}

      {/* Tab 2: Revision Flashcards */}
      {libraryTab === "flashcards" && (
        <FlashcardsView
          initialDeckId={activeFlashcardDeckId}
          onLaunchQuiz={() => {
            setLibraryTab("quizzes");
          }}
        />
      )}

      {/* Tab 3: Curated Guides & Practice Activities */}
      {libraryTab === "resources" && (
        <div className="space-y-6">

      {/* Filter & Search Bar */}
      <div className="p-4 rounded border border-line bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-4" />
            <input
              type="text"
              placeholder="Search concepts, guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink"
            />
          </div>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
          >
            <option value="">All Topics ({facets.topics.length})</option>
            {facets.topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
          >
            <option value="">All Difficulties</option>
            {facets.difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Saved Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`px-3 py-1.5 text-xs font-sans rounded border transition-colors flex items-center gap-1.5 ${
              savedOnly
                ? "bg-library-wash text-library border-library/40 font-medium"
                : "border-line text-ink-2 hover:text-ink"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Only</span>
          </button>
        </div>
      </div>

      {/* Resource Detail & Activity Modal */}
      {activeActivity && (
        <div className="p-6 border border-library/50 rounded bg-paper shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="library">
                  {activeActivity.activity.activityType.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs font-mono text-ink-2">
                  Min Passing: {Math.round(activeActivity.activity.completionPolicy.minRatio * 100)}%
                </span>
              </div>
              <h2 className="text-xl font-display font-medium text-ink mt-2">
                {activeActivity.activity.title}
              </h2>
              <p className="text-xs text-ink-2 font-sans mt-0.5">
                {activeActivity.activity.instructions}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveActivity(null);
                setAttemptResult(null);
                setSelectedAnswers({});
                setShortAnswerText("");
              }}
              className="text-xs font-mono text-ink-4 hover:text-ink"
            >
              Close
            </button>
          </div>

          {/* Activity Form */}
          {!attemptResult ? (
            <div className="space-y-6">
              {/* Knowledge Check Questions */}
              {activeActivity.activity.activityType === "knowledge_check" && (
                <div className="space-y-5">
                  {activeActivity.activity.contentPayload.questions?.map((q: any, qIdx: number) => (
                    <div key={q.id} className="p-4 rounded border border-line bg-card space-y-3">
                      <span className="text-xs font-mono text-ink-4">Question {qIdx + 1}</span>
                      <p className="font-sans font-medium text-sm text-ink">{q.text}</p>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt: any) => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2.5 p-2.5 rounded border text-xs font-sans cursor-pointer transition-colors ${
                              selectedAnswers[q.id] === opt.id
                                ? "border-library bg-library-wash/30 font-medium text-ink"
                                : "border-line hover:border-ink-2 text-ink-2"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.id}
                              checked={selectedAnswers[q.id] === opt.id}
                              onChange={() =>
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                              }
                              className="accent-library"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer Editor */}
              {activeActivity.activity.activityType === "short_answer" && (
                <div className="space-y-3">
                  <p className="text-sm font-book italic text-ink bg-wash/30 p-3 rounded border border-line">
                    &ldquo;{activeActivity.activity.contentPayload.prompt}&rdquo;
                  </p>
                  <textarea
                    rows={6}
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    placeholder="Provide your architectural analysis..."
                    className="w-full p-3 font-sans text-xs border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="primary"
                  disabled={submittingAttempt}
                  onClick={handleSubmitAttempt}
                >
                  <span>{submittingAttempt ? "Grading Attempt..." : "Submit Attempt"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            /* Attempt Evaluation Results */
            <div className="space-y-4 p-5 rounded border border-line bg-card">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <Badge variant={attemptResult.status === "passed" ? "strong" : "partial"}>
                    {attemptResult.status === "passed" ? "Passed" : "Needs Review"}
                  </Badge>
                  <span className="text-xs font-mono text-ink-2 ml-2">
                    Score: {attemptResult.score} / {attemptResult.maxScore} (
                    {Math.round((attemptResult.ratio ?? 0) * 100)}%)
                  </span>
                </div>
                <span className="text-xs font-mono text-ink-4">
                  Attempt #{attemptResult.attemptNumber}
                </span>
              </div>

              <p className="text-xs text-ink-2 font-sans">
                {attemptResult.status === "passed"
                  ? "Congratulations! You have satisfied the completion policy for this activity."
                  : "Score fell below passing threshold. Review the learning notes and try another attempt."}
              </p>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveActivity(null);
                    setAttemptResult(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {resources.length === 0 && !loading && (
        <EmptyState
          title="No technical resources match your filters"
          description="Try clearing search filters or selecting a different technical category."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setSelectedTopic("");
                setSelectedDifficulty("");
                setSavedOnly(false);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.slug}
            className="p-5 rounded border border-line bg-card flex flex-col justify-between space-y-4 hover:border-ink-2 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="library">
                    {resource.resourceType.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-[11px] font-mono text-ink-4">
                    {resource.estimatedMinutes} min
                  </span>
                  {resource.userProgress === "completed" && (
                    <Badge variant="strong">Completed</Badge>
                  )}
                </div>

                <button
                  onClick={() => handleToggleSave(resource.slug)}
                  className={`p-1.5 rounded transition-colors ${
                    resource.isSaved ? "text-library" : "text-ink-4 hover:text-ink"
                  }`}
                  title={resource.isSaved ? "Saved" : "Save resource"}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-display font-medium text-lg text-ink">
                {resource.title}
              </h3>

              <p className="text-xs text-ink-2 font-sans leading-relaxed line-clamp-3">
                {resource.description}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-4">
                <span>Source: {resource.attribution}</span>
                <a
                  href={resource.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink inline-flex items-center"
                >
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Bottom Actions & Activities */}
            <div className="pt-3 border-t border-line flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {resource.topicSlugs.map((slug) => (
                  <span
                    key={slug}
                    className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-wash text-ink-4 border border-line-3"
                  >
                    {slug}
                  </span>
                ))}
              </div>

              {resource.activities.length > 0 ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setActiveActivity({
                      resource,
                      activity: resource.activities[0],
                    });
                    setAttemptResult(null);
                    setSelectedAnswers({});
                    setShortAnswerText("");
                  }}
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>Practice Activity</span>
                </Button>
              ) : (
                <span className="text-xs font-mono text-ink-4">
                  Informational only
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </div>
  );
}
