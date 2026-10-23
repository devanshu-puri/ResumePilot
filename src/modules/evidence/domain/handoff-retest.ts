import { DerivedGap } from "./gap-rules";
import { ValidatedLearningResource } from "@/modules/library/domain/content-validator";
import { PreparedQuestion } from "@/modules/interview/services/question-generator";

/**
 * Handoff DTO between Interview Lab and Tech Library (EVD-T4, Invariant I-11).
 * Privacy contract: carries IDs and enums ONLY.
 * Never leaks candidate answer text or raw quotes.
 */
export interface HandoffDto {
  topicId: string;
  criterionIds: string[];
  evidenceIds: string[];
  gapRuleVersion: string;
}

export function createHandoffDto(gap: DerivedGap): HandoffDto {
  return {
    topicId: gap.topicId,
    criterionIds: gap.criterionIds,
    evidenceIds: gap.evidenceIds,
    gapRuleVersion: gap.gapRuleVersion,
  };
}

/**
 * Resource matching algorithm (EVD-T3, blueprint §4).
 * Matches gap to learning resources.
 * Order:
 * 1. Exact topic match
 * 2. Unmet prerequisites first
 * 3. Difficulty ascending (beginner -> intermediate -> advanced)
 * 4. Resources with practice activities first
 */
export function matchResourcesForGap(
  gap: DerivedGap,
  availableResources: ValidatedLearningResource[],
  prereqTopicIds: string[] = []
): ValidatedLearningResource[] {
  const matching = availableResources.filter(
    (r) =>
      r.topicSlugs.includes(gap.topicId) ||
      prereqTopicIds.some((p) => r.topicSlugs.includes(p))
  );

  const difficultyRank = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  return matching.sort((a, b) => {
    // 1. Exact topic vs prerequisite
    const aExact = a.topicSlugs.includes(gap.topicId) ? 1 : 0;
    const bExact = b.topicSlugs.includes(gap.topicId) ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    // 2. Has activity first
    const aHasAct = a.activities.length > 0 ? 1 : 0;
    const bHasAct = b.activities.length > 0 ? 1 : 0;
    if (aHasAct !== bHasAct) return bHasAct - aHasAct;

    // 3. Difficulty ascending
    const aDiff = difficultyRank[a.difficulty] ?? 2;
    const bDiff = difficultyRank[b.difficulty] ?? 2;
    return aDiff - bDiff;
  });
}

/**
 * Selects comparable retest question (EVD-T5).
 * - Must match comparabilityKey
 * - Must NOT return an already-answered question id
 * - Returns null if no comparable question exists in bank
 */
export function selectRetestQuestion(
  topicId: string,
  comparabilityKey: string,
  answeredQuestionIds: Set<string>,
  questionBank: PreparedQuestion[]
): PreparedQuestion | null {
  for (const q of questionBank) {
    if (
      q.topicId === topicId &&
      q.comparabilityKey === comparabilityKey &&
      !answeredQuestionIds.has(q.id)
    ) {
      return q;
    }
  }
  return null;
}
