import { AppError } from "@/shared/errors/app-error";

export interface CriterionScoreInput {
  criterionId: string;
  score: number;
  maxScore: number;
}

export interface AggregatedScoreResult {
  totalScore: number;
  maxScore: number;
  ratio: number;
}

/**
 * Pure function to bound, validate, and aggregate criterion scores (INT-T3, Invariant I-04).
 * Rejects any score outside [0, maxScore].
 * Sums totals purely in deterministic code.
 */
export function aggregateScore(criteria: CriterionScoreInput[]): AggregatedScoreResult {
  if (!criteria || criteria.length === 0) {
    return { totalScore: 0, maxScore: 0, ratio: 0 };
  }

  let totalScore = 0;
  let totalMax = 0;

  for (const item of criteria) {
    if (typeof item.score !== "number" || isNaN(item.score)) {
      throw AppError.validation(`Invalid criterion score for ${item.criterionId}: not a valid number`);
    }

    if (item.maxScore <= 0) {
      throw AppError.validation(`Invalid maxScore for ${item.criterionId}: must be greater than 0`);
    }

    // Strict bounds check: 0 <= score <= maxScore
    if (item.score < 0 || item.score > item.maxScore) {
      throw AppError.validation(
        `Criterion score out of bounds for ${item.criterionId}: received ${item.score}, must be within [0, ${item.maxScore}]`
      );
    }

    totalScore += item.score;
    totalMax += item.maxScore;
  }

  const ratio = totalMax > 0 ? Number((totalScore / totalMax).toFixed(4)) : 0;

  return {
    totalScore: Number(totalScore.toFixed(2)),
    maxScore: Number(totalMax.toFixed(2)),
    ratio: Math.max(0, Math.min(1, ratio)),
  };
}
