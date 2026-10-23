"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ParsedProject,
  ProjectQuestion,
  ProjectQuestionStatus,
} from "@/content/projects/project-panel-schema";
import { DEFAULT_SAMPLE_PROJECT } from "@/content/projects/sample-project-data";
import { generateProjectQuestions } from "@/content/projects/project-question-generator";
import { Eyebrow, HeroEyebrowRule } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Mic,
  Zap,
  Check,
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export interface ProjectInterviewPanelProps {
  projects?: ParsedProject[];
}

export function ProjectInterviewPanel({
  projects = [DEFAULT_SAMPLE_PROJECT],
}: ProjectInterviewPanelProps) {
  // Active Project Selection
  const [activeProjectId, setActiveProjectId] = useState<string>(
    projects[0]?.id || DEFAULT_SAMPLE_PROJECT.id
  );

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_SAMPLE_PROJECT;

  // Questions cache per project (generated deterministically)
  const [projectQuestionsMap, setProjectQuestionsMap] = useState<
    Record<string, ProjectQuestion[]>
  >({});

  // Initialize or fetch questions for projects
  useEffect(() => {
    setProjectQuestionsMap((prev) => {
      const updated = { ...prev };
      for (const p of projects) {
        if (!updated[p.id]) {
          updated[p.id] = generateProjectQuestions(p);
        }
      }
      return updated;
    });
  }, [projects]);

  const questions: ProjectQuestion[] =
    projectQuestionsMap[activeProject.id] || generateProjectQuestions(activeProject);

  // Mode: Study Mode vs Mock Panel Mode
  const [mode, setMode] = useState<"study" | "mock">("study");

  // Study Mode State: Filter & Expanded Cards
  const [studyFilter, setStudyFilter] = useState<
    "all" | "got_it" | "need_review" | "unreviewed"
  >("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Mock Panel Mode State: Sequential simulation
  const [mockIndex, setMockIndex] = useState(0);
  const [mockRevealed, setMockRevealed] = useState(false);
  const [mockTimerSeconds, setMockTimerSeconds] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock Timer
  useEffect(() => {
    if (mode === "mock" && timerRunning && mockTimerSeconds > 0) {
      mockTimerRef.current = setInterval(() => {
        setMockTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (mockTimerRef.current) {
      clearInterval(mockTimerRef.current);
    }
    return () => {
      if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    };
  }, [mode, timerRunning, mockTimerSeconds]);

  // Toggle card expansion in Study Mode
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Update question status
  const handleSetStatus = (questionId: string, status: ProjectQuestionStatus) => {
    setProjectQuestionsMap((prev) => {
      const currentList = prev[activeProject.id] || [];
      const updated = currentList.map((q) =>
        q.id === questionId ? { ...q, status } : q
      );
      return { ...prev, [activeProject.id]: updated };
    });
  };

  // Advance Mock Question
  const handleMockNext = (status: ProjectQuestionStatus) => {
    const currentQ = questions[mockIndex];
    if (currentQ) {
      handleSetStatus(currentQ.id, status);
    }

    if (mockIndex < questions.length - 1) {
      setMockIndex((prev) => prev + 1);
      setMockRevealed(false);
      setMockTimerSeconds(120);
      setTimerRunning(true);
    } else {
      setMode("study");
    }
  };

  // Filtered list for study mode
  const filteredQuestions = useMemo(() => {
    if (studyFilter === "all") return questions;
    return questions.filter((q) => q.status === studyFilter);
  }, [questions, studyFilter]);

  // Overall Stats
  const stats = useMemo(() => {
    const gotIt = questions.filter((q) => q.status === "got_it").length;
    const needReview = questions.filter((q) => q.status === "need_review").length;
    const unreviewed = questions.filter((q) => q.status === "unreviewed").length;
    return { total: questions.length, gotIt, needReview, unreviewed };
  }, [questions]);

  // Format timer MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Header */}
      <Reveal direction="up" delay={50} className="border-b border-line pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Eyebrow module="interview">MODULE II · PROJECT INTERVIEW PANEL</Eyebrow>
          <h1 className="text-3xl sm:text-4xl font-sans font-medium text-ink mt-2">
            Senior Project <span className="font-serif italic text-accent-indigo">Defense.</span>
          </h1>
          <HeroEyebrowRule className="my-3" />
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            10 rigorous STAR architecture and trade-off questions grounded directly in your resume projects.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded border border-line bg-card">
          <button
            type="button"
            onClick={() => {
              setMode("study");
              setTimerRunning(false);
            }}
            className={clsx(
              "px-3 py-1.5 rounded text-xs font-sans transition-all flex items-center gap-1.5",
              mode === "study"
                ? "bg-interview-wash text-interview font-medium shadow-sm"
                : "text-ink-2 hover:text-ink"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("mock");
              setMockIndex(0);
              setMockRevealed(false);
              setMockTimerSeconds(120);
              setTimerRunning(true);
            }}
            className={clsx(
              "px-3 py-1.5 rounded text-xs font-sans transition-all flex items-center gap-1.5",
              mode === "mock"
                ? "bg-interview-wash text-interview font-medium shadow-sm"
                : "text-ink-2 hover:text-ink"
            )}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Mock Simulation</span>
          </button>
        </div>
      </Reveal>

      {/* 1. PROJECT SELECTOR & METADATA HERO */}
      <div className="space-y-4">
        {/* Project Tabs (if multiple projects exist) */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActiveProjectId(p.id);
                  setMockIndex(0);
                  setMockRevealed(false);
                }}
                className={clsx(
                  "px-3 py-1.5 rounded text-xs font-sans border whitespace-nowrap transition-colors",
                  activeProjectId === p.id
                    ? "border-interview bg-interview-wash text-interview font-medium shadow-sm"
                    : "border-line bg-card text-ink-2 hover:border-ink-2"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Project Snapshot Card */}
        <Reveal direction="up" delay={100}>
          <SpotlightCard className="p-6 rounded-lg bg-canvas/90 backdrop-blur-sm space-y-4 border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="interview">GROUNDED IN RESUME</Badge>
                  {activeProject.role && (
                    <span className="text-xs font-mono text-ink-2">
                      Role: {activeProject.role}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-ink mt-2">
                  {activeProject.name}
                </h2>
              </div>

              {/* Quick Defense Readiness Score */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-strong-wash text-strong font-medium">
                  ✓ {stats.gotIt} Got It
                </span>
                <span className="px-2.5 py-1 rounded bg-partial-wash text-partial font-medium">
                  ⚠️ {stats.needReview} Review
                </span>
              </div>
            </div>

            {/* Resume Summary Quote in Book Serif */}
            <p className="font-book italic text-xs sm:text-sm text-ink-2 leading-relaxed border-l-2 border-interview/40 pl-3.5">
              &ldquo;{activeProject.summary}&rdquo;
            </p>

            {/* Tech Stack & Key Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4 mr-1">
                Stack:
              </span>
              {activeProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-wash border border-line-3 text-ink"
                >
                  {tech}
                </span>
              ))}

              {activeProject.metrics && activeProject.metrics.length > 0 && (
                <>
                  <span className="text-ink-4 mx-1">•</span>
                  {activeProject.metrics.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-interview-wash text-interview border border-interview/30 font-medium"
                    >
                      ⚡ {m}
                    </span>
                  ))}
                </>
              )}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* 2. MODE 1: STUDY MODE (Deep Review) */}
      {mode === "study" && (
        <div className="space-y-6">
          {/* Status Filter Bar */}
          <div className="p-3.5 rounded border border-line bg-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-4 mr-1">
                Filter:
              </span>
              {(
                [
                  { id: "all", label: `All (${stats.total})` },
                  { id: "got_it", label: `Got It (${stats.gotIt})` },
                  { id: "need_review", label: `Need Review (${stats.needReview})` },
                  { id: "unreviewed", label: `Unreviewed (${stats.unreviewed})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStudyFilter(f.id)}
                  className={clsx(
                    "px-2.5 py-1 rounded text-xs font-sans border transition-colors",
                    studyFilter === f.id
                      ? "border-interview bg-interview-wash text-interview font-medium shadow-sm"
                      : "border-line text-ink-2 hover:text-ink bg-paper"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-ink-4">
              Showing {filteredQuestions.length} defense questions
            </span>
          </div>

          {/* Question Cards Accordion */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = !!expandedIds[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded border border-line bg-card overflow-hidden transition-all shadow-sm"
                >
                  {/* Collapsed Card Header */}
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-wash/30 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-interview-wash text-interview border border-interview/30 font-medium">
                          {q.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-wash text-ink-4 border border-line-3">
                          {q.difficulty}
                        </span>
                        {q.status === "got_it" && (
                          <Badge variant="strong">✓ Got It</Badge>
                        )}
                        {q.status === "need_review" && (
                          <Badge variant="partial">⚠️ Need Review</Badge>
                        )}
                      </div>

                      <h3 className="font-sans font-medium text-sm sm:text-base text-ink leading-snug">
                        {idx + 1}. {q.question}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded text-ink-4 hover:text-ink transition-colors flex-shrink-0 mt-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-line bg-paper/60 space-y-6">
                      {/* STAR Model Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-interview" />
                          <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
                            STAR Model Answer (Senior Architecture Rubric)
                          </span>
                        </div>
                        <div className="p-4 rounded border border-line bg-card text-xs sm:text-sm font-sans text-ink leading-relaxed whitespace-pre-line space-y-2">
                          {q.modelAnswer}
                        </div>
                      </div>

                      {/* 2-Column Details: Key Points & Common Traps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Key Points Checklist */}
                        <div className="p-4 rounded border border-line bg-card space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-strong font-medium block">
                            Key Points Interviewer Looks For
                          </span>
                          <ul className="space-y-1.5 text-xs font-sans text-ink">
                            {q.keyPoints.map((kp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-strong font-bold">✓</span>
                                <span className="leading-relaxed">{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Common Traps */}
                        <div className="p-4 rounded border border-line bg-card space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-weak font-medium block">
                            Common Traps To Avoid
                          </span>
                          <ul className="space-y-1.5 text-xs font-sans text-ink-2">
                            {q.commonMistakes.map((cm, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-weak font-bold">✗</span>
                                <span className="leading-relaxed">{cm}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Follow-up Pushbacks */}
                      {q.followUps.length > 0 && (
                        <div className="p-4 rounded border border-line bg-wash/30 space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4 block">
                            Interviewer Follow-Up Pushbacks
                          </span>
                          <ul className="space-y-1 text-xs font-sans text-ink">
                            {q.followUps.map((fu, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-interview font-mono">→</span>
                                <span className="italic leading-relaxed">{fu}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Status Toggle Action Buttons */}
                      <div className="pt-2 border-t border-line flex items-center justify-between">
                        <span className="text-[11px] font-mono text-ink-4">
                          Mark your defense preparedness:
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetStatus(q.id, "need_review")}
                            className={clsx(
                              q.status === "need_review" &&
                                "border-partial text-partial bg-partial-wash"
                            )}
                          >
                            <span>⚠️ Need Review</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSetStatus(q.id, "got_it")}
                            className={clsx(
                              q.status === "got_it" &&
                                "border-strong bg-strong hover:bg-strong/90 text-white"
                            )}
                          >
                            <span>✓ Got It</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MODE 2: MOCK PANEL MODE (Live Practice) */}
      {mode === "mock" && (
        <div className="space-y-6 max-w-3xl">
          {/* Top Simulation Bar */}
          <div className="p-4 rounded border border-line bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-interview animate-pulse" />
              <span className="text-xs font-mono font-medium text-ink uppercase tracking-wider">
                Live Simulation: Question {mockIndex + 1} of {questions.length}
              </span>
            </div>

            {/* 2-Minute Timer Display */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink-4" />
              <span
                className={clsx(
                  "text-sm font-mono font-medium",
                  mockTimerSeconds < 30 ? "text-weak animate-pulse" : "text-ink"
                )}
              >
                {formatTimer(mockTimerSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className="text-xs font-mono text-interview hover:underline ml-2"
              >
                {timerRunning ? "Pause" : "Resume"}
              </button>
            </div>
          </div>

          {/* Active Question Card */}
          {questions[mockIndex] && (
            <div className="framed p-6 sm:p-8 rounded bg-paper space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-interview-wash text-interview border border-interview/30 font-medium">
                    {questions[mockIndex].category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-wash text-ink-4 border border-line-3">
                    {questions[mockIndex].difficulty}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-display font-medium text-ink leading-snug">
                  &ldquo;{questions[mockIndex].question}&rdquo;
                </h2>
              </div>

              {/* Practice Instruction Callout */}
              {!mockRevealed && (
                <div className="p-5 rounded border border-line bg-wash/30 text-center space-y-3">
                  <Mic className="w-6 h-6 text-interview mx-auto" />
                  <p className="text-xs sm:text-sm font-sans text-ink-2 max-w-md mx-auto leading-relaxed">
                    Practice answering out loud using the <strong>STAR method</strong> (Situation, Task, Action, Result) before revealing the senior benchmark.
                  </p>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => {
                      setMockRevealed(true);
                      setTimerRunning(false);
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span>Reveal Senior Model Answer</span>
                  </Button>
                </div>
              )}

              {/* Revealed STAR Answer & Evaluation */}
              {mockRevealed && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-interview font-medium block">
                      Senior STAR Benchmark
                    </span>
                    <div className="p-4 rounded border border-line bg-card text-xs sm:text-sm font-sans text-ink leading-relaxed whitespace-pre-line">
                      {questions[mockIndex].modelAnswer}
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="p-4 rounded border border-line bg-wash/30 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-strong font-medium block">
                      Did you cover these key points?
                    </span>
                    <ul className="space-y-1 text-xs font-sans text-ink">
                      {questions[mockIndex].keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-strong">✓</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Self Evaluation Buttons */}
                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-mono text-ink-4">
                      How was your response?
                    </span>
                    <div className="flex items-center gap-3">
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={() => handleMockNext("need_review")}
                      >
                        <span>⚠️ Need Review</span>
                      </Button>
                      <Button
                        size="md"
                        variant="primary"
                        onClick={() => handleMockNext("got_it")}
                      >
                        <span>✓ Got It</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
