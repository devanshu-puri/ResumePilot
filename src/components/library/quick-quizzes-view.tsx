"use client";

import React, { useState, useEffect } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  Filter,
  Sparkles,
} from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  options: QuizOption[];
  hint?: string;
  topicSlug: string;
  source: string;
  codeSnippet?: string;
}

interface QuizMeta {
  id: string;
  title: string;
  category: string;
  relatedSkillOrProject: string;
  topicSlug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  questionCount: number;
  isResumeGrounded: boolean;
  bestScore?: number;
  lastScore?: number;
  isCompleted: boolean;
  relatedDeckId?: string;
}

interface AttemptResult {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "passed" | "needs_review";
  topicBreakdown: Record<string, { total: number; correct: number }>;
  questionsReview: {
    questionId: string;
    question: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
    topicSlug: string;
  }[];
  topicsToRevisit: string[];
}

interface QuickQuizzesViewProps {
  onOpenFlashcardDeck?: (deckId: string) => void;
}

export function QuickQuizzesView({ onOpenFlashcardDeck }: QuickQuizzesViewProps) {
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "incomplete">("all");

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<{
    id: string;
    title: string;
    category: string;
    relatedSkillOrProject: string;
    questions: Question[];
    relatedDeckId?: string;
  } | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [filterIncorrectOnly, setFilterIncorrectOnly] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setCategories(data.categories || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Launch a quiz
  const handleStartQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data.quiz);
        setCurrentQIndex(0);
        setAnswers({});
        setShowHint(false);
        setAttemptResult(null);
        setFilterIncorrectOnly(false);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  // Submit full quiz
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const data = await res.json();
        setAttemptResult(data.attempt);
        fetchQuizzes();
      }
    } catch {
      // Ignored
    } finally {
      setSubmitting(false);
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    if (selectedCategory && q.category !== selectedCategory) return false;
    if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
    if (statusFilter === "completed" && !q.isCompleted) return false;
    if (statusFilter === "incomplete" && q.isCompleted) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Active Quiz Player Mode */}
      {activeQuiz && !attemptResult && (
        <div className="p-6 border border-library/40 rounded bg-paper shadow-sm space-y-6">
          {/* Header & Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="library">{activeQuiz.category}</Badge>
                <span className="text-xs font-mono text-ink-2">
                  {activeQuiz.relatedSkillOrProject}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setAnswers({});
                }}
                className="text-xs font-mono text-ink-4 hover:text-ink"
              >
                Exit Quiz
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-ink font-medium">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </span>
              <span className="text-ink-4">
                {Object.keys(answers).length} of {activeQuiz.questions.length} answered
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-wash rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-library h-1.5 transition-all duration-300"
                style={{
                  width: `${((currentQIndex + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Question View */}
          {activeQuiz.questions[currentQIndex] && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-4">
                    Topic: {activeQuiz.questions[currentQIndex].topicSlug}
                  </span>
                  {activeQuiz.questions[currentQIndex].source === "resume_based" && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-resume-wash text-resume border border-resume/30">
                      Grounded in Resume
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-sans font-medium text-ink leading-relaxed">
                  {activeQuiz.questions[currentQIndex].question}
                </h3>
              </div>

              {/* Code Snippet if present */}
              {activeQuiz.questions[currentQIndex].codeSnippet && (
                <pre className="p-3 bg-ink text-paper rounded text-xs font-mono overflow-x-auto">
                  <code>{activeQuiz.questions[currentQIndex].codeSnippet}</code>
                </pre>
              )}

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {activeQuiz.questions[currentQIndex].options.map((opt) => {
                  const qId = activeQuiz.questions[currentQIndex].id;
                  const isSelected = answers[qId] === opt.id;

                  return (
                    <label
                      key={opt.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qId]: opt.id }))}
                      className={`flex items-start gap-3 p-3.5 rounded border text-xs sm:text-sm font-sans cursor-pointer transition-colors ${
                        isSelected
                          ? "border-library bg-library-wash/40 font-medium text-ink ring-1 ring-library"
                          : "border-line bg-card hover:border-ink-2 text-ink-2"
                      }`}
                    >
                      <input
                        type="radio"
                        name={qId}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [qId]: opt.id }))}
                        className="mt-0.5 accent-library"
                      />
                      <span className="leading-relaxed">{opt.text}</span>
                    </label>
                  );
                })}
              </div>

              {/* Hint Box (Optional, Doesn't Reveal Answer) */}
              {activeQuiz.questions[currentQIndex].hint && (
                <div className="pt-2">
                  {!showHint ? (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="text-xs font-mono text-ink-4 hover:text-library flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Need a hint? (Does not reveal answer)</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded border border-warning/30 bg-warning-wash/20 text-xs text-ink-2 font-sans flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-ink block mb-0.5">Hint:</span>
                        <span>{activeQuiz.questions[currentQIndex].hint}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-line">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => {
                    setCurrentQIndex((prev) => Math.max(0, prev - 1));
                    setShowHint(false);
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Previous</span>
                </Button>

                {currentQIndex < activeQuiz.questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setCurrentQIndex((prev) => prev + 1);
                      setShowHint(false);
                    }}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={submitting}
                    onClick={handleSubmitQuiz}
                  >
                    <span>{submitting ? "Evaluating..." : "Submit Quiz"}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Results Screen */}
      {activeQuiz && attemptResult && (
        <div className="p-6 border border-line rounded bg-paper shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={attemptResult.status === "passed" ? "strong" : "partial"}>
                  {attemptResult.status === "passed" ? "Passed" : "Needs Revision"}
                </Badge>
                <span className="text-xs font-mono text-ink-2">
                  {activeQuiz.relatedSkillOrProject}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-ink mt-2">
                Quiz Results: {activeQuiz.title}
              </h2>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-mono text-ink-4 block">Final Score</span>
              <span className="text-2xl font-mono font-semibold text-ink">
                {attemptResult.score} / {attemptResult.maxScore} ({attemptResult.percentage}%)
              </span>
            </div>
          </div>

          {/* Topic-Wise Performance */}
          <div className="p-4 rounded border border-line bg-card space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
              Topic-Wise Performance
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(attemptResult.topicBreakdown).map(([topic, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic} className="p-2.5 rounded border border-line bg-paper space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ink font-medium">{topic}</span>
                      <span className={pct >= 70 ? "text-strong" : "text-weak"}>{pct}%</span>
                    </div>
                    <span className="text-[10px] text-ink-4 block">
                      {stats.correct} of {stats.total} correct
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Questions to Revisit Recommendation */}
          {attemptResult.topicsToRevisit.length > 0 && (
            <div className="p-4 rounded border border-library/30 bg-library-wash/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-ink flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-library" />
                  Topics to Revisit: {attemptResult.topicsToRevisit.join(", ")}
                </span>
                <p className="text-xs text-ink-2 font-sans">
                  Revise foundational concepts using the corresponding flashcard deck to solidify understanding.
                </p>
              </div>

              {activeQuiz.relatedDeckId && onOpenFlashcardDeck && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onOpenFlashcardDeck(activeQuiz.relatedDeckId!)}
                >
                  <span>Revise Flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Detailed Question Explanations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
                Detailed Question Review
              </span>
              <button
                onClick={() => setFilterIncorrectOnly(!filterIncorrectOnly)}
                className="text-xs font-mono text-library hover:underline"
              >
                {filterIncorrectOnly ? "Show All Questions" : "Review Incorrect Answers Only"}
              </button>
            </div>

            <div className="space-y-3">
              {attemptResult.questionsReview
                .filter((q) => !filterIncorrectOnly || !q.isCorrect)
                .map((q, idx) => (
                  <div
                    key={q.questionId}
                    className={`p-4 rounded border space-y-2.5 ${
                      q.isCorrect
                        ? "border-strong/30 bg-strong-wash/10"
                        : "border-weak/30 bg-weak-wash/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-ink-4">Question {idx + 1}</span>
                      <span
                        className={`font-mono font-medium flex items-center gap-1 ${
                          q.isCorrect ? "text-strong" : "text-weak"
                        }`}
                      >
                        {q.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-sm font-sans font-medium text-ink">{q.question}</p>

                    <div className="p-3 rounded border border-line bg-paper text-xs font-sans space-y-1">
                      <span className="font-medium text-ink block">Explanation:</span>
                      <p className="text-ink-2 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-line flex flex-wrap gap-3 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                handleStartQuiz(activeQuiz.id);
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retake Quiz</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveQuiz(null);
                setAttemptResult(null);
              }}
            >
              <span>Return to Library</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Quizzes List View */}
      {!activeQuiz && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded border border-line bg-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
              >
                <option value="all">All Quizzes</option>
                <option value="completed">Completed Only</option>
                <option value="incomplete">Incomplete Only</option>
              </select>
            </div>

            <span className="text-xs font-mono text-ink-4">
              Showing {filteredQuizzes.length} quizzes
            </span>
          </div>

          {/* Quizzes Grid */}
          {filteredQuizzes.length === 0 && !loading && (
            <EmptyState
              title="No quizzes match your filters"
              description="Try selecting a different category or clearing filters."
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded border border-line bg-card flex flex-col justify-between space-y-4 hover:border-ink-2 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="library">{quiz.category}</Badge>
                      <span className="text-[11px] font-mono text-ink-4">
                        {quiz.questionCount} MCQs · {quiz.estimatedMinutes} min
                      </span>
                    </div>

                    {quiz.isCompleted ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-strong-wash text-strong border border-strong/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {quiz.bestScore}% Passed
                      </span>
                    ) : quiz.lastScore !== undefined ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-partial-wash text-partial border border-partial/30">
                        {quiz.lastScore}% Review
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="font-display font-medium text-lg text-ink">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-sans text-ink-2">
                        {quiz.relatedSkillOrProject}
                      </span>
                      {quiz.isResumeGrounded && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-resume-wash text-resume">
                          From Resume
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-mono text-ink-4 capitalize">
                    {quiz.difficulty} Level
                  </span>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStartQuiz(quiz.id)}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    <span>{quiz.lastScore !== undefined ? "Retake Quiz" : "Start Quiz"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
