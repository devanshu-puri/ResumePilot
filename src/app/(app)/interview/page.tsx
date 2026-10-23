"use client";

import React, { useState, useEffect } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FramedPanel } from "@/components/ui/framed-panel";
import { CriterionRow } from "@/components/ui/criterion-row";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeBox } from "@/components/ui/code-box";
import {
  MessageSquare,
  Play,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Pause,
  CornerDownRight,
  BookOpen,
} from "lucide-react";

interface Question {
  id: string;
  topicId: string;
  questionType: string;
  prompt: string;
  expectedConcepts: string[];
  rubricId: string;
  claimTextSnapshot?: string;
  difficulty: string;
}

interface CriterionResult {
  criterionId: string;
  criterionName: string;
  score: number | null;
  maxScore: number;
  evidenceQuote?: string | null;
  feedback: string;
}

interface Evaluation {
  evaluationId: string;
  status: "completed" | "inconclusive" | "failed";
  totalScore: number | null;
  maxScore: number | null;
  ratio: number | null;
  explanation: string;
  uncertaintyNotes?: string;
  criteriaResults: CriterionResult[];
}

interface FollowUp {
  id: string;
  followUpType: string;
  prompt: string;
  rationale: string;
}

interface Session {
  id: string;
  sessionType: string;
  status: "draft" | "in_progress" | "paused" | "completed";
  targetRole: string;
  currentQuestionIndex: number;
  questions: Question[];
}

export default function InterviewLabPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUp | null>(null);
  const [sessionType, setSessionType] = useState<"defense" | "challenge" | "mock">("challenge");
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [activeResumeClaims, setActiveResumeClaims] = useState<any[]>([]);

  // Load active resume claims on mount
  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.resume?.claims) {
          const nonExcluded = data.resume.claims.filter((c: any) => !c.excluded);
          const confirmed = nonExcluded.filter((c: any) => c.userConfirmed);
          const availableClaims = confirmed.length > 0 ? confirmed : nonExcluded;
          setActiveResumeClaims(availableClaims);
          if (availableClaims.length > 0) {
            setSessionType("defense");
          }
        }
      })
      .catch(() => {});
  }, []);

  // Start new practice session
  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    setCurrentEvaluation(null);
    setCurrentFollowUp(null);
    setAnswerText("");

    try {
      const payload: any = {
        sessionType,
        targetRole,
      };

      if (sessionType === "defense" && activeResumeClaims.length > 0) {
        payload.claims = activeResumeClaims.map((c: any) => ({
          claimText: c.claimText,
          topicSlug: c.topics?.[0]?.slug || "system-architecture",
          topicName: c.topics?.[0]?.name || "System Architecture",
        }));
      } else {
        payload.topicSlugs = ["redis-caching", "sql-fundamentals", "distributed-systems"];
      }

      const res = await fetch("/api/interview-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to generate interview session. Please try again.");
      }
    } catch (err) {
      setError((err as Error).message || "Network error while connecting to interview lab.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer & Evaluate
  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/interview-sessions/${session.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseText: answerText,
          answerFormat: "text",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEvaluation(data.evaluation);

        // Auto-request follow-up if evaluation completed
        if (data.evaluation.status === "completed") {
          const fuRes = await fetch(`/api/interview-sessions/${session.id}/follow-ups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responseId: data.response.id }),
          });
          if (fuRes.ok) {
            const fuData = await fuRes.json();
            if (fuData.followUp) {
              setCurrentFollowUp(fuData.followUp);
            }
          }
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  // Advance to next question
  const handleNextQuestion = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/interview-sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEXT_QUESTION" }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setAnswerText("");
        setCurrentEvaluation(null);
        setCurrentFollowUp(null);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const isLastQuestion = session ? session.currentQuestionIndex >= session.questions.length - 1 : false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Eyebrow module="interview">MODULE 02 · INTERVIEW LAB</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
            Adaptive Technical Interview
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            Defense against your confirmed resume claims and conceptual deep dives.
          </p>
        </div>

        {session && session.status === "in_progress" && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-ink-2">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 border border-weak rounded bg-weak-wash text-weak text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Picker / Start Screen */}
      {!session && (
        <FramedPanel className="space-y-6 max-w-2xl mx-auto">
          <div>
            <Eyebrow module="interview">CONFIGURATION</Eyebrow>
            <h2 className="text-xl font-display font-medium text-ink mt-2">
              Start Practice Session
            </h2>
            <p className="text-xs text-ink-2 font-sans mt-1">
              Select an interview mode to generate authentic questions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSessionType("defense")}
              className={`p-4 rounded border text-left transition-colors ${
                sessionType === "defense"
                  ? "border-interview bg-interview-wash/30"
                  : "border-line bg-card hover:border-ink-2"
              }`}
            >
              <span className="font-display font-medium text-sm text-ink block">
                Resume Defense
              </span>
              <span className="text-[11px] text-ink-2 mt-1 block">
                Defend claims extracted from your resume.
              </span>
              {activeResumeClaims.length === 0 && (
                <span className="text-[10px] text-weak block mt-2">
                  (Requires confirmed claims)
                </span>
              )}
            </button>

            <button
              onClick={() => setSessionType("challenge")}
              className={`p-4 rounded border text-left transition-colors ${
                sessionType === "challenge"
                  ? "border-interview bg-interview-wash/30"
                  : "border-line bg-card hover:border-ink-2"
              }`}
            >
              <span className="font-display font-medium text-sm text-ink block">
                Topic Challenge
              </span>
              <span className="text-[11px] text-ink-2 mt-1 block">
                Deep architectural inquiry across core topics.
              </span>
            </button>

            <button
              onClick={() => setSessionType("mock")}
              className={`p-4 rounded border text-left transition-colors ${
                sessionType === "mock"
                  ? "border-interview bg-interview-wash/30"
                  : "border-line bg-card hover:border-ink-2"
              }`}
            >
              <span className="font-display font-medium text-sm text-ink block">
                Full Mock Mix
              </span>
              <span className="text-[11px] text-ink-2 mt-1 block">
                Ordered sequence of defense and conceptual items.
              </span>
            </button>
          </div>

          {sessionType === "defense" && activeResumeClaims.length === 0 && (
            <div className="p-4 rounded border border-line bg-wash/60 space-y-2">
              <div className="flex items-center gap-2 text-ink font-medium text-xs">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Resume Defense requires confirmed claims from your resume</span>
              </div>
              <p className="text-[11px] text-ink-2 leading-relaxed">
                You haven&apos;t confirmed any claims on your resume yet. You can upload and confirm claims on your resume, or select <strong>Topic Challenge</strong> to practice architectural questions immediately without a resume.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href="/resume">
                  <Button variant="secondary" size="sm">
                    <span>Upload / Review Resume</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </a>
                <Button variant="secondary" size="sm" onClick={() => setSessionType("challenge")}>
                  <span>Switch to Topic Challenge</span>
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="primary"
              disabled={loading || (sessionType === "defense" && activeResumeClaims.length === 0)}
              onClick={handleStartSession}
            >
              <Play className="w-4 h-4 mr-2" />
              <span>{loading ? "Generating Questions..." : "Begin Interview Session"}</span>
            </Button>
          </div>
        </FramedPanel>
      )}

      {/* Active Session Question Workspace */}
      {session && session.status === "in_progress" && currentQuestion && (
        <div className="space-y-6">
          {/* Framed Question Box with Corner Ticks */}
          <FramedPanel className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-interview" />
                <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
                  {currentQuestion.topicId}
                </span>
                <span className="text-ink-4">·</span>
                <span className="text-xs font-mono text-ink-2">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <Badge variant="interview">
                {currentQuestion.questionType.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Resume Claim Snapshot if defense question */}
            {currentQuestion.claimTextSnapshot && (
              <div className="p-3 border-l-2 border-resume bg-resume-wash/20 text-xs">
                <span className="text-[10px] font-mono uppercase text-resume font-medium block mb-0.5">
                  Grounded in Resume Claim
                </span>
                <p className="font-book italic text-ink">
                  &ldquo;{currentQuestion.claimTextSnapshot}&rdquo;
                </p>
              </div>
            )}

            {/* Editorial Serif Question Prompt */}
            <div className="pl-3 border-l-2 border-interview">
              <p className="font-book text-lg sm:text-xl text-ink leading-relaxed">
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Expected Concepts */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-4 block mb-1.5">
                Key Concepts Evaluator Expects
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentQuestion.expectedConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs font-mono rounded bg-wash text-ink-2 border border-line"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </FramedPanel>

          {/* Answer Workspace */}
          {!currentEvaluation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-ink-2">
                  Your Technical Explanation
                </label>
                <span className="text-xs font-mono text-ink-4">
                  Reviewed, not executed
                </span>
              </div>

              <textarea
                rows={8}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Explain the internal architecture, trade-offs, and failure handling..."
                className="w-full p-4 font-sans text-sm border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink leading-relaxed"
              />

              <div className="flex justify-end gap-3">
                <Button
                  variant="primary"
                  disabled={loading || answerText.trim().length === 0}
                  onClick={handleSubmitAnswer}
                >
                  <span>{loading ? "Evaluating Answer..." : "Submit Answer"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            /* Evaluation Breakdown & Follow-up Section */
            <div className="space-y-6">
              <div className="p-5 border border-line rounded bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="font-display font-medium text-base text-ink">
                      Evaluation Breakdown
                    </h3>
                    <p className="text-xs text-ink-2 font-sans mt-0.5">
                      {currentEvaluation.explanation}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-ink-4 block">Total Score</span>
                    <span className="font-mono font-semibold text-base text-ink">
                      {currentEvaluation.totalScore !== null
                        ? `${currentEvaluation.totalScore} / ${currentEvaluation.maxScore}`
                        : "Not scored"}
                    </span>
                  </div>
                </div>

                {/* Per-Criterion Rows */}
                <div className="space-y-1">
                  {currentEvaluation.criteriaResults.map((crit) => (
                    <CriterionRow
                      key={crit.criterionId}
                      criterionName={crit.criterionName}
                      score={crit.score}
                      maxScore={crit.maxScore}
                      feedback={crit.feedback}
                      evidenceQuote={crit.evidenceQuote}
                    />
                  ))}
                </div>
              </div>

              {/* Follow-up Question Prompt */}
              {currentFollowUp && (
                <div className="p-4 border border-interview/40 rounded bg-interview-wash/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <CornerDownRight className="w-4 h-4 text-interview" />
                    <span className="text-xs font-mono uppercase tracking-wider text-interview font-medium">
                      Follow-Up Question ({currentFollowUp.followUpType.replace(/_/g, " ")})
                    </span>
                  </div>
                  <p className="font-book text-base text-ink leading-relaxed">
                    {currentFollowUp.prompt}
                  </p>
                  <p className="text-xs text-ink-2 italic font-sans pt-1">
                    Rationale: {currentFollowUp.rationale}
                  </p>
                </div>
              )}

              {/* Next Question / Finish Action */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="primary" onClick={handleNextQuestion}>
                  <span>{isLastQuestion ? "View Session Report" : "Next Question"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Session Report */}
      {session && session.status === "completed" && (
        <div className="space-y-6">
          <FramedPanel className="space-y-4">
            <Eyebrow module="interview">SESSION COMPLETED</Eyebrow>
            <h2 className="text-2xl font-display font-medium text-ink">
              Interview Performance Summary
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 font-sans">
              All evaluations have been recorded to your append-only evidence ledger.
            </p>

            <div className="p-4 border border-line rounded bg-wash/30 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-medium">
                Topics to Revisit (Evidenced Gaps)
              </span>
              <div className="flex flex-wrap gap-2">
                <EvidenceChip
                  sourceType="Interview"
                  topicName={session.questions[0]?.topicId || "redis-caching"}
                  ratio={0.4}
                  href="/library"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = "/library";
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Open Practice Studio</span>
              </Button>
              <Button variant="secondary" onClick={() => setSession(null)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Start Another Session</span>
              </Button>
            </div>
          </FramedPanel>
        </div>
      )}
    </div>
  );
}
