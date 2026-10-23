"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  DrillQuestion,
  ConfidenceLevel,
  QuestionDifficulty,
} from "@/content/drills/drill-schema";
import { VERIFIED_DRILL_QUESTIONS } from "@/content/drills/drill-data";
import { Eyebrow, HeroEyebrowRule } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBox } from "@/components/ui/code-box";
import {
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Zap,
  Target,
  Filter,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";

export interface SkillDrillsRunnerProps {
  parsedSkills?: string[];
  initialQuestions?: DrillQuestion[];
  onComplete?: (result: {
    total: number;
    correct: number;
    xpEarned: number;
  }) => void;
}

export function SkillDrillsRunner({
  parsedSkills = ["React", "TypeScript", "PostgreSQL", "Redis", "System Design"],
  initialQuestions = VERIFIED_DRILL_QUESTIONS,
  onComplete,
}: SkillDrillsRunnerProps) {
  // Pre-Drill Filter State
  const [selectedSkills, setSelectedSkills] = useState<string[]>(parsedSkills);
  const [difficultyFilter, setDifficultyFilter] = useState<
    QuestionDifficulty | "mixed"
  >("mixed");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [drillActive, setDrillActive] = useState(false);

  // Active Session Questions
  const [sessionDeck, setSessionDeck] = useState<DrillQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Current Question Answering State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Soft Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Round History & Metacognitive Tracking
  const [history, setHistory] = useState<
    Array<{
      question: DrillQuestion;
      selectedOptionId: string;
      confidence: ConfidenceLevel;
      isCorrect: boolean;
      timeSpentSeconds: number;
    }>
  >([]);
  const [roundComplete, setRoundComplete] = useState(false);

  // Timer logic
  useEffect(() => {
    if (drillActive && !roundComplete && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [drillActive, roundComplete, isSubmitted]);

  // Skill toggle in pre-filter
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSelectAllSkills = () => {
    setSelectedSkills(parsedSkills);
  };

  // Start the drill
  const handleStartDrill = () => {
    // Filter questions by skill and difficulty
    let pool = initialQuestions.filter((q) =>
      selectedSkills.some((s) => s.toLowerCase() === q.skillId.toLowerCase())
    );

    // If empty fallback to all
    if (pool.length === 0) pool = initialQuestions;

    if (difficultyFilter !== "mixed") {
      const diffMatches = pool.filter((q) => q.difficulty === difficultyFilter);
      if (diffMatches.length > 0) pool = diffMatches;
    }

    // Shuffle and slice count
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCount);

    setSessionDeck(shuffled);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setConfidence(null);
    setIsSubmitted(false);
    setHistory([]);
    setRoundComplete(false);
    setElapsedSeconds(0);
    setDrillActive(true);
  };

  // Current Question
  const currentQuestion: DrillQuestion | undefined = sessionDeck[currentIdx];

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !confidence || !currentQuestion || isSubmitted) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    setIsSubmitted(true);

    const record = {
      question: currentQuestion,
      selectedOptionId,
      confidence,
      isCorrect,
      timeSpentSeconds: elapsedSeconds,
    };

    setHistory((prev) => [...prev, record]);
  };

  // Advance to Next Question or Summary
  const handleNextQuestion = () => {
    if (currentIdx < sessionDeck.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setConfidence(null);
      setIsSubmitted(false);
      setElapsedSeconds(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setRoundComplete(true);
      const totalCorrect = history.filter((h) => h.isCorrect).length + (selectedOptionId === currentQuestion?.correctOptionId ? 1 : 0);
      const xp = totalCorrect * 15;
      onComplete?.({
        total: sessionDeck.length,
        correct: totalCorrect,
        xpEarned: xp,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = history.length;
    const correct = history.filter((h) => h.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const xp = correct * 15;

    // Metacognitive insight
    const certainAnswers = history.filter((h) => h.confidence === "certain");
    const certainCorrect = certainAnswers.filter((h) => h.isCorrect).length;
    const certainAccuracy =
      certainAnswers.length > 0
        ? Math.round((certainCorrect / certainAnswers.length) * 100)
        : null;

    let calibrationNote = "Good calibration across your answers.";
    if (certainAccuracy !== null && certainAccuracy >= 85) {
      calibrationNote = `High confidence accuracy (${certainAccuracy}%)! Your mental models in confirmed skills are well-grounded.`;
    } else if (certainAccuracy !== null && certainAccuracy < 60) {
      calibrationNote = `Calibration Gap Alert: ${100 - certainAccuracy}% of questions marked "100% Certain" were missed. Review the distractor notes carefully.`;
    }

    return { total, correct, accuracy, xp, calibrationNote };
  }, [history]);

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ----------------------------------------------------
  // VIEW 1: Pre-Drill Filter Card
  // ----------------------------------------------------
  if (!drillActive) {
    return (
      <div className="space-y-6">
        <div className="border-b border-line pb-4">
          <Eyebrow module="interview">MODULE II · SKILL DRILLS</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-ink mt-2">
            Targeted Technical Drills
          </h1>
          <HeroEyebrowRule className="my-3" />
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            Rapid, adaptive interview questions tailored directly to your resume&apos;s verified tech stack.
          </p>
        </div>

        <div className="framed p-6 sm:p-8 rounded bg-paper space-y-6 max-w-3xl shadow-sm">
          {/* Skill Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-ink-4">
                1. Select Target Skills ({selectedSkills.length} of {parsedSkills.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAllSkills}
                className="text-xs font-mono text-interview hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {parsedSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={clsx(
                      "px-3 py-1.5 rounded text-xs font-sans border transition-all flex items-center gap-1.5",
                      isSelected
                        ? "border-interview bg-interview-wash text-interview font-medium shadow-sm"
                        : "border-line bg-card text-ink-2 hover:border-ink-2"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-ink-4 block">
              2. Difficulty Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["basic", "medium", "hard", "mixed"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyFilter(diff)}
                  className={clsx(
                    "p-2.5 rounded text-xs font-sans capitalize border text-center transition-all",
                    difficultyFilter === diff
                      ? "border-interview bg-interview-wash text-interview font-medium shadow-sm"
                      : "border-line bg-card text-ink-2 hover:border-ink-2"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Count Selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-ink-4 block">
              3. Number of Questions
            </label>
            <div className="flex items-center gap-3">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={clsx(
                    "px-4 py-2 rounded text-xs font-mono border transition-all",
                    questionCount === cnt
                      ? "border-interview bg-interview-wash text-interview font-medium"
                      : "border-line bg-card text-ink-2 hover:border-ink-2"
                  )}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-line flex items-center justify-between">
            <span className="text-xs font-mono text-ink-4">
              XP Reward: +15 XP per correct answer
            </span>
            <Button size="md" variant="primary" onClick={handleStartDrill}>
              <span>Start Drill Session</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: Round Summary
  // ----------------------------------------------------
  if (roundComplete) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="border-b border-line pb-4">
          <Eyebrow module="interview">DRILL COMPLETED</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-ink mt-2">
            Skill Drill Summary
          </h1>
          <HeroEyebrowRule className="my-3" />
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            Diagnostic performance metrics and metacognitive calibration results.
          </p>
        </div>

        <div className="framed p-6 sm:p-8 rounded bg-paper space-y-6 shadow-sm">
          {/* Score Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-line bg-card text-center space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4">
                Accuracy Score
              </span>
              <div className="text-3xl font-display font-medium text-ink">
                {summaryMetrics.accuracy}%
              </div>
              <span className="text-xs font-mono text-ink-2">
                {summaryMetrics.correct} of {summaryMetrics.total} correct
              </span>
            </div>

            <div className="p-4 rounded border border-line bg-card text-center space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4">
                XP Earned
              </span>
              <div className="text-3xl font-display font-medium text-interview">
                +{summaryMetrics.xp} XP
              </div>
              <span className="text-xs font-mono text-ink-2">
                +15 XP per correct item
              </span>
            </div>

            <div className="p-4 rounded border border-line bg-card text-center space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4">
                Pacing
              </span>
              <div className="text-3xl font-display font-medium text-ink">
                {Math.round(
                  history.reduce((a, b) => a + b.timeSpentSeconds, 0) /
                    (history.length || 1)
                )}s
              </div>
              <span className="text-xs font-mono text-ink-2">Avg. time per question</span>
            </div>
          </div>

          {/* Metacognitive Calibration Insight */}
          <div className="p-4 rounded border border-line bg-wash/30 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-interview flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
                Metacognitive Calibration Insight
              </span>
              <p className="text-xs font-sans text-ink-2 leading-relaxed">
                {summaryMetrics.calibrationNote}
              </p>
            </div>
          </div>

          {/* Review Question List */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-4 block">
              Question Breakdown
            </span>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={h.question.id}
                  className="p-3 rounded border border-line bg-card flex items-center justify-between text-xs font-sans"
                >
                  <div className="flex items-center gap-2.5 truncate mr-3">
                    {h.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-strong flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-weak flex-shrink-0" />
                    )}
                    <span className="font-mono text-ink-4">Q{i + 1}</span>
                    <span className="truncate text-ink font-medium">
                      {h.question.stem}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={h.isCorrect ? "strong" : "weak"}>
                      {h.isCorrect ? "Correct" : "Missed"}
                    </Badge>
                    <span className="text-[10px] font-mono text-ink-4 capitalize">
                      {h.confidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => {
                setDrillActive(false);
                setRoundComplete(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Configure New Drill</span>
            </Button>

            <Button variant="primary" onClick={handleStartDrill}>
              <span>Practice Again</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: Active Question Runner
  // ----------------------------------------------------
  if (!currentQuestion) return null;

  const currentOptions = currentQuestion.options;
  const isCorrect = isSubmitted && selectedOptionId === currentQuestion.correctOptionId;

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Bar: Progress, Timer & XP Chip */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Eyebrow module="interview">
            QUESTION {currentIdx + 1} OF {sessionDeck.length}
          </Eyebrow>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-ink-4">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="interview">+{currentQuestion.xpAward} XP</Badge>
          <button
            onClick={() => setDrillActive(false)}
            className="text-xs font-mono text-ink-4 hover:text-ink transition-colors"
          >
            Exit Drill
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-1 bg-line rounded-full overflow-hidden">
        <div
          className="h-full bg-interview transition-all duration-300"
          style={{
            width: `${((currentIdx + 1) / sessionDeck.length) * 100}%`,
          }}
        />
      </div>

      {/* 2-COLUMN DESKTOP SPLIT VIEW (≥ 1024px) / STACKED ON MOBILE (< 1024px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Question Stem, Metadata & Code (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="framed p-6 sm:p-7 rounded bg-paper space-y-5 shadow-sm">
            {/* Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="interview">{currentQuestion.skillId}</Badge>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-wash text-ink border border-line-3">
                {currentQuestion.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-wash text-ink-4 border border-line-3">
                {currentQuestion.type}
              </span>
            </div>

            {/* Question Stem in Serif font per DESIGN.md */}
            <p className="font-book text-lg sm:text-xl text-ink leading-relaxed">
              {currentQuestion.stem}
            </p>

            {/* Code Snippet (if present) using CodeBox */}
            {currentQuestion.codeSnippet && (
              <div className="pt-1">
                <CodeBox
                  code={currentQuestion.codeSnippet}
                  language={currentQuestion.codeLanguage || "typescript"}
                  banner="Verified Code Snippet"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Options, Confidence Picker, Submit & Feedback (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Options Card */}
          <div className="p-6 rounded border border-line bg-card space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-4 block">
              Select Answer Option
            </span>

            <div className="space-y-2.5">
              {currentOptions.map((opt, i) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrectOption = opt.id === currentQuestion.correctOptionId;

                let stateClass = "border-line bg-paper hover:border-ink-2 text-ink-2";
                if (isSubmitted) {
                  if (isCorrectOption) {
                    stateClass = "border-strong bg-strong-wash text-ink font-medium";
                  } else if (isSelected && !isCorrectOption) {
                    stateClass = "border-weak bg-weak-wash text-ink";
                  } else {
                    stateClass = "border-line opacity-50 text-ink-4";
                  }
                } else if (isSelected) {
                  stateClass = "border-interview bg-interview-wash text-ink font-medium shadow-sm";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={clsx(
                      "w-full flex items-start gap-3 p-3.5 rounded border text-left text-xs font-sans transition-all",
                      stateClass
                    )}
                  >
                    <span
                      className={clsx(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5",
                        isSubmitted && isCorrectOption
                          ? "bg-strong text-white"
                          : isSubmitted && isSelected && !isCorrectOption
                          ? "bg-weak text-white"
                          : isSelected
                          ? "bg-interview text-white"
                          : "bg-wash text-ink-4"
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-relaxed flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* CONFIDENCE GATE (Before Submit) */}
            {!isSubmitted && (
              <div className="pt-3 border-t border-line space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-4">
                    Confidence Gate (Pick before submit)
                  </span>
                  {!confidence && selectedOptionId && (
                    <span className="text-[11px] font-mono text-interview animate-pulse">
                      Select confidence to unlock
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "guessing", label: "Guessing" },
                      { id: "unsure", label: "Unsure" },
                      { id: "certain", label: "100% Certain" },
                    ] as const
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setConfidence(lvl.id)}
                      className={clsx(
                        "p-2 rounded text-xs font-sans border text-center transition-all",
                        confidence === lvl.id
                          ? "border-interview bg-interview-wash text-interview font-medium shadow-sm"
                          : "border-line bg-paper text-ink-2 hover:border-ink-2"
                      )}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                <Button
                  size="md"
                  variant="primary"
                  className="w-full mt-3"
                  disabled={!selectedOptionId || !confidence}
                  onClick={handleSubmitAnswer}
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}
          </div>

          {/* 5-PART FEEDBACK CARD (Revealed on Submit) */}
          {isSubmitted && (
            <div
              className={clsx(
                "p-5 sm:p-6 rounded border space-y-4 shadow-sm animate-fade-in",
                isCorrect
                  ? "border-strong/50 bg-strong-wash/40"
                  : "border-weak/50 bg-weak-wash/40"
              )}
            >
              {/* Part 1: Verdict */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-strong flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-weak flex-shrink-0" />
                  )}
                  <span className="font-sans font-medium text-sm text-ink">
                    {isCorrect ? "✓ Correct (+15 XP)" : "✗ Incorrect"}
                  </span>
                </div>
                <Badge variant={isCorrect ? "strong" : "weak"}>
                  {confidence?.toUpperCase()} CONFIDENCE
                </Badge>
              </div>

              {/* Part 2: Why (Technical Mechanism) */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4 block">
                  Why It Works
                </span>
                <p className="text-xs sm:text-sm font-sans text-ink leading-relaxed">
                  {currentQuestion.explanation.why}
                </p>
              </div>

              {/* Part 3: Distractor Breakdown */}
              {Object.keys(currentQuestion.explanation.distractors).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-4 block">
                    Distractor Analysis (Why Others Are Wrong)
                  </span>
                  <ul className="space-y-1.5 text-xs font-sans text-ink-2">
                    {Object.entries(currentQuestion.explanation.distractors).map(
                      ([optKey, reason]) => (
                        <li key={optKey} className="flex items-start gap-1.5">
                          <span className="text-ink-4 font-mono">•</span>
                          <span>{reason}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Part 4: Senior Interview Takeaway */}
              <div className="p-3.5 rounded border border-line bg-card/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink">
                  <Award className="w-3.5 h-3.5 text-interview" />
                  <span>Senior Interview Tip</span>
                </div>
                <p className="text-xs font-sans text-ink-2 leading-relaxed">
                  {currentQuestion.explanation.takeaway}
                </p>
              </div>

              {/* Part 5: Next Question Button */}
              <div className="pt-2 flex justify-end">
                <Button size="md" variant="primary" onClick={handleNextQuestion}>
                  <span>
                    {currentIdx < sessionDeck.length - 1
                      ? "Next Question"
                      : "View Drill Summary"}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM SUBMIT CTA (< 1024px) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 p-3 bg-paper/95 backdrop-blur-md border-t border-line z-40 flex items-center justify-between gap-3 shadow-lg">
        <span className="text-xs font-mono text-ink-4">
          Q{currentIdx + 1} of {sessionDeck.length}
        </span>
        {!isSubmitted ? (
          <Button
            size="sm"
            variant="primary"
            disabled={!selectedOptionId || !confidence}
            onClick={handleSubmitAnswer}
          >
            <span>Submit</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={handleNextQuestion}>
            <span>
              {currentIdx < sessionDeck.length - 1 ? "Next" : "Summary"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
