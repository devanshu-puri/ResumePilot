import { AppError } from "@/shared/errors/app-error";

export type ProgressStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "passed"
  | "needs_review"
  | "completed"
  | "evaluation_failed";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "passed"
  | "needs_review"
  | "evaluation_failed";

export interface ActivityAttemptRecord {
  id: string;
  activityId: string;
  attemptNumber: number;
  score: number | null;
  maxScore: number | null;
  ratio: number | null;
  status: AttemptStatus;
}

export interface ResourceCompletionPolicy {
  minRatio?: number; // default 0.8 (80%)
  requiredPassedActivities?: number; // default 1
}

/**
 * Pure function to calculate next attempt number (LIB-T4).
 * Always max(attemptNumber) + 1, strictly positive.
 */
export function nextAttemptNumber(
  existingAttempts: { attemptNumber: number }[]
): number {
  if (!existingAttempts || existingAttempts.length === 0) {
    return 1;
  }
  const max = Math.max(...existingAttempts.map((a) => a.attemptNumber));
  return max + 1;
}

/**
 * Evaluates a knowledge_check activity deterministically in code (LIB-T5).
 * Questions carry options with correct flag; bounds and scores validated purely in code.
 */
export function evaluateKnowledgeCheck(
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
  }[],
  selectedOptionIds: Record<string, string>,
  policy: { minRatio?: number } = { minRatio: 0.8 }
): {
  score: number;
  maxScore: number;
  ratio: number;
  status: "passed" | "needs_review";
  breakdown: { questionId: string; isCorrect: boolean; correctOptionId: string }[];
} {
  if (!questions || questions.length === 0) {
    return { score: 0, maxScore: 0, ratio: 0, status: "needs_review", breakdown: [] };
  }

  let correctCount = 0;
  const breakdown: { questionId: string; isCorrect: boolean; correctOptionId: string }[] = [];

  for (const q of questions) {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const selected = selectedOptionIds[q.id];
    const isCorrect = Boolean(correctOpt && selected === correctOpt.id);

    if (isCorrect) correctCount++;

    breakdown.push({
      questionId: q.id,
      isCorrect,
      correctOptionId: correctOpt?.id || "",
    });
  }

  const maxScore = questions.length;
  const ratio = Number((correctCount / maxScore).toFixed(4));
  const minRatio = policy.minRatio ?? 0.8;
  const status: "passed" | "needs_review" = ratio >= minRatio ? "passed" : "needs_review";

  return {
    score: correctCount,
    maxScore,
    ratio,
    status,
    breakdown,
  };
}

/**
 * Computes overall resource completion status based on attempts and policy (LIB-T4, Invariant I-10).
 * Viewing a resource alone records lastAccessedAt; "completed" requires explicit policy fulfillment.
 */
export function computeResourceProgress(
  hasStartedActivity: boolean,
  attempts: ActivityAttemptRecord[],
  totalActivitiesCount: number,
  policy: ResourceCompletionPolicy = { minRatio: 0.8, requiredPassedActivities: 1 }
): ProgressStatus {
  // If resource has no activities, it remains informational
  if (totalActivitiesCount === 0) {
    return "not_started";
  }

  if (attempts.length === 0) {
    return hasStartedActivity ? "in_progress" : "not_started";
  }

  // Count distinct passed activities
  const passedActivityIds = new Set(
    attempts.filter((a) => a.status === "passed").map((a) => a.activityId)
  );

  const requiredPassed = Math.min(
    policy.requiredPassedActivities ?? 1,
    totalActivitiesCount
  );

  if (passedActivityIds.size >= requiredPassed) {
    return "completed";
  }

  // If latest attempt failed or needs review
  const latestAttempt = attempts[attempts.length - 1];
  if (latestAttempt.status === "passed") {
    return "passed";
  }
  if (latestAttempt.status === "needs_review") {
    return "needs_review";
  }
  if (latestAttempt.status === "evaluation_failed") {
    return "evaluation_failed";
  }

  return "in_progress";
}
