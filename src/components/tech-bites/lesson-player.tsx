"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Lesson,
  LessonStep,
  LessonCompletionResult,
} from "@/content/tech-bites/lesson-schema";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBox } from "@/components/ui/code-box";
import { StepDiagram } from "@/components/tech-bites/step-diagram";
import {
  Clock,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Compass,
  Check,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

export interface LessonPlayerProps {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  // Current stage: 0 = Why, 1 = Mental Model, 2 = See It, 3 = Try It, 4 = Recall
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [visitedMaxIdx, setVisitedMaxIdx] = useState(0);

  // Try it interactive state
  const [tryItSelectedId, setTryItSelectedId] = useState<string | null>(null);
  const [tryItSubmitted, setTryItSubmitted] = useState(false);

  // Recall interactive state
  const [recallSelectedId, setRecallSelectedId] = useState<string | null>(null);
  const [submittingRecall, setSubmittingRecall] = useState(false);
  const [completionResult, setCompletionResult] = useState<LessonCompletionResult | null>(null);

  // Bookmark toggle
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Start timer for duration tracking
  const startTimeRef = useRef<number>(0);
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const currentStep: LessonStep = lesson.steps[currentStageIdx];
  const isFinalStage = currentStageIdx === 4;

  // Advance stage
  const handleNextStage = () => {
    if (currentStageIdx < 4) {
      const next = currentStageIdx + 1;
      setCurrentStageIdx(next);
      if (next > visitedMaxIdx) {
        setVisitedMaxIdx(next);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Jump to stage
  const handleSelectStage = (idx: number) => {
    if (idx <= visitedMaxIdx) {
      setCurrentStageIdx(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit recall and complete lesson
  const handleSubmitRecall = async () => {
    if (!recallSelectedId || submittingRecall || completionResult) return;
    setSubmittingRecall(true);

    const durationMs = Math.max(1000, Date.now() - startTimeRef.current);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          recallAnswerId: recallSelectedId,
          tryItAnswerId: tryItSelectedId ?? undefined,
          durationMs,
          bookmarked: isBookmarked,
        }),
      });

      if (res.ok) {
        const result: LessonCompletionResult = await res.json();
        setCompletionResult(result);
      } else {
        // Fallback deterministic client evaluation
        const recallStep = lesson.steps[4];
        const correct =
          recallStep.interactiveExercise?.correctOptionId === recallSelectedId;
        setCompletionResult({
          lessonId: lesson.id,
          recallPassed: correct,
          xpAwarded: correct ? (lesson.xpAward ?? 50) : 0,
          totalXp: correct ? (lesson.xpAward ?? 50) : 0,
          completedAt: new Date().toISOString(),
          bookmarked: isBookmarked,
          feedback: correct
            ? `Mental model verified! You mastered "${lesson.title}" and earned +${lesson.xpAward ?? 50} XP.`
            : recallStep.interactiveExercise?.explanation || "Incorrect answer.",
        });
      }
    } catch {
      // Offline fallback
      const recallStep = lesson.steps[4];
      const correct =
        recallStep.interactiveExercise?.correctOptionId === recallSelectedId;
      setCompletionResult({
        lessonId: lesson.id,
        recallPassed: correct,
        xpAwarded: correct ? (lesson.xpAward ?? 50) : 0,
        totalXp: correct ? (lesson.xpAward ?? 50) : 0,
        completedAt: new Date().toISOString(),
        bookmarked: isBookmarked,
        feedback: correct
          ? `Mental model verified! You mastered "${lesson.title}".`
          : recallStep.interactiveExercise?.explanation || "Incorrect answer.",
      });
    } finally {
      setSubmittingRecall(false);
    }
  };

  const STAGE_NAMES = [
    { num: 1, type: "why", label: "Why", time: "1 min" },
    { num: 2, type: "mental_model", label: "Mental Model", time: "3 min" },
    { num: 3, type: "see_it", label: "See It", time: "4 min" },
    { num: 4, type: "try_it", label: "Try It", time: "4 min" },
    { num: 5, type: "recall", label: "Active Recall", time: "3 min" },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/tech-bites"
            className="text-xs font-mono text-ink-2 hover:text-ink flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tech Bites</span>
          </Link>
          <span className="text-ink-4">/</span>
          <span className="text-xs font-mono text-ink font-medium truncate max-w-[200px] sm:max-w-md">
            {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="library">15-MIN BITE</Badge>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-sans transition-colors",
              isBookmarked
                ? "bg-library-wash text-library border-library/40 font-medium"
                : "border-line text-ink-2 hover:text-ink"
            )}
            title="Save for Revision"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isBookmarked ? "Saved" : "Save for Revision"}
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE ONLY: 5-Segment Top Progress Bar (< 640px) */}
      <div className="block lg:hidden space-y-2">
        <div className="grid grid-cols-5 gap-1.5">
          {STAGE_NAMES.map((s, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleSelectStage(idx)}
                disabled={idx > visitedMaxIdx}
                className={clsx(
                  "h-2 rounded-sm transition-all",
                  isCompleted
                    ? "bg-strong"
                    : isCurrent
                    ? "bg-library"
                    : "bg-line hover:bg-line-3"
                )}
                title={`Stage ${s.num}: ${s.label}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-4">
          <span>
            Stage {currentStep.stageNumber} of 5: {STAGE_NAMES[currentStageIdx].label}
          </span>
          <span>{currentStep.durationMinutes} min</span>
        </div>
      </div>

      {/* 3-COLUMN DESKTOP LAYOUT (≥ 1280px) & 2-COLUMN (≥ 1024px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Stage Stepper Timeline (Desktop 3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-6">
          <div className="p-4 rounded border border-line bg-card space-y-4">
            <div className="border-b border-line pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4">
                15-Minute Blueprint
              </span>
              <h3 className="text-sm font-sans font-medium text-ink mt-0.5">
                5 Interactive Stages
              </h3>
            </div>

            <nav className="space-y-2" aria-label="Lesson Stages">
              {lesson.steps.map((step, idx) => {
                const isCurrent = idx === currentStageIdx;
                const isCompleted = idx < currentStageIdx;
                const isClickable = idx <= visitedMaxIdx;

                return (
                  <button
                    key={step.stageNumber}
                    type="button"
                    onClick={() => handleSelectStage(idx)}
                    disabled={!isClickable}
                    className={clsx(
                      "w-full flex items-start gap-3 p-2.5 rounded text-left transition-all border",
                      isCurrent
                        ? "border-library bg-library-wash text-ink font-medium shadow-sm"
                        : isCompleted
                        ? "border-transparent hover:bg-wash/60 text-ink"
                        : "border-transparent opacity-60 text-ink-4 cursor-not-allowed"
                    )}
                  >
                    {/* Stage Number Badge */}
                    <span
                      className={clsx(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5",
                        isCurrent
                          ? "bg-library text-on-ink"
                          : isCompleted
                          ? "bg-strong-wash text-strong"
                          : "bg-wash text-ink-4"
                      )}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : step.stageNumber}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans truncate">
                          {STAGE_NAMES[idx].label}
                        </span>
                        <span className="text-[10px] font-mono text-ink-4 ml-1">
                          {step.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-ink-2 truncate mt-0.5">
                        {step.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-line pt-3 flex items-center justify-between text-xs font-mono text-ink-4">
              <span>Total Est.</span>
              <span className="text-ink font-medium">15 Minutes</span>
            </div>
          </div>

          {/* Quick Bookmark Card */}
          <div className="p-4 rounded border border-line bg-paper-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-sans font-medium text-ink block">
                Save for Revision
              </span>
              <span className="text-[11px] font-sans text-ink-4 block">
                Access anytime from Library
              </span>
            </div>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={clsx(
                "p-2 rounded border transition-colors",
                isBookmarked
                  ? "bg-library-wash text-library border-library/50"
                  : "border-line text-ink-4 hover:text-ink bg-card"
              )}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN: Stage Content & Interactive Element (Desktop 6 cols / Full mobile) */}
        <main className="lg:col-span-9 xl:col-span-6 space-y-6">
          {/* Main Stage Card (Blueprint Framed Hero) */}
          <div className="framed p-6 sm:p-8 rounded bg-paper space-y-6 shadow-sm">
            {/* Stage Eyebrow & Meta */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Eyebrow module="library">
                  STAGE {currentStep.stageNumber} · {STAGE_NAMES[currentStageIdx].label.toUpperCase()}
                </Eyebrow>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-ink-4">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentStep.durationMinutes} min read</span>
              </div>
            </div>

            {/* Stage Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-ink">
                {currentStep.title}
              </h2>
            </div>

            {/* Stage 1 ELI5 Callout (if on Why stage) */}
            {currentStageIdx === 0 && lesson.eli5 && (
              <div className="p-4 rounded border border-library/40 bg-library-wash/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-library uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Like I'm 5 (Intuition)</span>
                </div>
                <p className="text-xs sm:text-sm font-book italic text-ink leading-relaxed">
                  &ldquo;{lesson.eli5}&rdquo;
                </p>
              </div>
            )}

            {/* Stage Content Markdown / Instructions */}
            <div className="prose prose-sm max-w-none text-ink font-sans text-sm leading-relaxed space-y-3 whitespace-pre-line">
              {currentStep.content}
            </div>

            {/* Stage 2 Interactive Diagram (if present) */}
            {currentStep.diagramNodes && currentStep.diagramNodes.length > 0 && (
              <div className="pt-2">
                <StepDiagram nodes={currentStep.diagramNodes} />
              </div>
            )}

            {/* Stage 3 Code Walkthrough (if present) */}
            {currentStep.codeSnippet && (
              <div className="space-y-2 pt-2">
                <CodeBox
                  code={currentStep.codeSnippet}
                  language={currentStep.codeLanguage || "typescript"}
                  banner="Verified Pattern"
                />
              </div>
            )}

            {/* Key Takeaway Chip */}
            {currentStep.keyTakeaway && (
              <div className="p-3.5 rounded border border-line bg-wash/30 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-ink text-on-ink flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                  ★
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4 block">
                    Core Rule
                  </span>
                  <p className="text-xs font-sans text-ink font-medium leading-relaxed">
                    {currentStep.keyTakeaway}
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 4: Interactive Scenario / Trade-off Challenge */}
            {currentStep.stage === "try_it" && currentStep.interactiveExercise && (
              <div className="p-5 rounded border border-library/30 bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-library" />
                  <span className="text-xs font-mono font-medium text-ink uppercase tracking-wider">
                    Interactive Scenario Challenge
                  </span>
                </div>

                <p className="text-sm font-sans font-medium text-ink leading-relaxed">
                  {currentStep.interactiveExercise.prompt}
                </p>

                <div className="space-y-2.5 pt-1">
                  {currentStep.interactiveExercise.options.map((opt) => {
                    const isSelected = tryItSelectedId === opt.id;
                    const isCorrect =
                      opt.id === currentStep.interactiveExercise?.correctOptionId;
                    const showFeedback = isSelected && tryItSubmitted;

                    return (
                      <div key={opt.id} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTryItSelectedId(opt.id);
                            setTryItSubmitted(true);
                          }}
                          className={clsx(
                            "w-full flex items-center gap-3 p-3 rounded border text-left text-xs font-sans transition-all",
                            showFeedback && isCorrect
                              ? "border-strong bg-strong-wash/40 font-medium text-ink"
                              : showFeedback && !isCorrect
                              ? "border-weak bg-weak-wash/40 text-ink"
                              : isSelected
                              ? "border-library bg-library-wash text-ink font-medium"
                              : "border-line bg-paper hover:border-ink-2 text-ink-2"
                          )}
                        >
                          <span
                            className={clsx(
                              "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
                              isSelected
                                ? "border-library bg-library text-on-ink"
                                : "border-ink-4"
                            )}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Immediate feedback explanation */}
                {tryItSubmitted && (
                  <div
                    className={clsx(
                      "p-3.5 rounded border text-xs font-sans leading-relaxed space-y-1 animate-fade-in",
                      tryItSelectedId === currentStep.interactiveExercise.correctOptionId
                        ? "border-strong/40 bg-strong-wash text-ink"
                        : "border-partial/40 bg-partial-wash text-ink"
                    )}
                  >
                    <span className="font-mono font-medium uppercase text-[10px] block">
                      {tryItSelectedId === currentStep.interactiveExercise.correctOptionId
                        ? "✓ Architectural Decision Correct"
                        : "ℹ Trade-off Analysis"}
                    </span>
                    <p>{currentStep.interactiveExercise.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 5: Active Recall Check to Earn XP */}
            {currentStep.stage === "recall" && currentStep.interactiveExercise && (
              <div className="p-5 rounded border border-library/50 bg-card space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-library" />
                    <span className="text-xs font-mono font-medium text-ink uppercase tracking-wider">
                      Active Recall Verification
                    </span>
                  </div>
                  <Badge variant="library">+{lesson.xpAward ?? 50} XP</Badge>
                </div>

                <p className="text-sm font-sans font-medium text-ink leading-relaxed">
                  {currentStep.interactiveExercise.prompt}
                </p>

                <div className="space-y-2.5">
                  {currentStep.interactiveExercise.options.map((opt) => {
                    const isSelected = recallSelectedId === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded border text-xs font-sans cursor-pointer transition-all",
                          isSelected
                            ? "border-library bg-library-wash text-ink font-medium shadow-sm"
                            : "border-line bg-paper hover:border-ink-2 text-ink-2"
                        )}
                      >
                        <input
                          type="radio"
                          name="recallOption"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => setRecallSelectedId(opt.id)}
                          className="accent-library"
                          disabled={!!completionResult}
                        />
                        <span className="flex-1">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Completion Result & XP Claim Card */}
                {completionResult && (
                  <div
                    className={clsx(
                      "p-4 rounded border space-y-3 animate-fade-in",
                      completionResult.recallPassed
                        ? "border-strong/50 bg-strong-wash text-ink"
                        : "border-partial/50 bg-partial-wash text-ink"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {completionResult.recallPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-strong flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-partial flex-shrink-0" />
                        )}
                        <span className="font-sans font-medium text-sm">
                          {completionResult.recallPassed
                            ? "Mental Model Mastered!"
                            : "Review Needed"}
                        </span>
                      </div>
                      {completionResult.recallPassed && (
                        <Badge variant="strong">+{completionResult.xpAwarded} XP Earned</Badge>
                      )}
                    </div>

                    <p className="text-xs font-sans leading-relaxed">
                      {completionResult.feedback}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <Link href="/tech-bites">
                        <Button size="sm" variant="primary">
                          Explore More Tech Bites
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions inside Card */}
            <div className="border-t border-line pt-4 flex items-center justify-between">
              {currentStageIdx > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentStageIdx(currentStageIdx - 1)}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Previous</span>
                </Button>
              ) : (
                <div />
              )}

              {!isFinalStage ? (
                <Button size="md" variant="primary" onClick={handleNextStage}>
                  <span>Continue to Stage {currentStageIdx + 2}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                !completionResult && (
                  <Button
                    size="md"
                    variant="primary"
                    disabled={!recallSelectedId || submittingRecall}
                    onClick={handleSubmitRecall}
                  >
                    <span>
                      {submittingRecall ? "Verifying..." : "Complete & Claim XP"}
                    </span>
                    <Sparkles className="w-4 h-4 ml-1.5" />
                  </Button>
                )
              )}
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Sticky Reference Cards (Desktop Wide 3 cols) */}
        <aside className="hidden xl:block xl:col-span-3 space-y-6 sticky top-6">
          {/* Where It Is Used */}
          <div className="p-4 rounded border border-line bg-card space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-library" />
              <span>Where It Is Used</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lesson.reference.whereUsed.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded text-xs font-sans bg-wash border border-line-3 text-ink"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Commonly Confused With */}
          <div className="p-4 rounded border border-line bg-card space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-partial" />
              <span>Commonly Confused With</span>
            </div>
            <ul className="space-y-2 text-xs font-sans text-ink-2">
              {lesson.reference.commonlyConfusedWith.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-partial font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Takeaways */}
          <div className="p-4 rounded border border-line bg-card space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-strong" />
              <span>Core Takeaways</span>
            </div>
            <ul className="space-y-2 text-xs font-sans text-ink">
              {lesson.reference.remember.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-strong font-bold">✓</span>
                  <span className="leading-relaxed text-ink-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* MOBILE STICKY BOTTOM "CONTINUE" CTA (< 640px) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 p-3 bg-paper/95 backdrop-blur-md border-t border-line z-40 flex items-center justify-between gap-3 shadow-lg">
        <span className="text-xs font-mono text-ink-4">
          Stage {currentStep.stageNumber} of 5
        </span>
        {!isFinalStage ? (
          <Button size="sm" variant="primary" onClick={handleNextStage}>
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        ) : (
          !completionResult && (
            <Button
              size="sm"
              variant="primary"
              disabled={!recallSelectedId || submittingRecall}
              onClick={handleSubmitRecall}
            >
              <span>{submittingRecall ? "Verifying..." : "Claim XP"}</span>
              <Sparkles className="w-3.5 h-3.5 ml-1" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
