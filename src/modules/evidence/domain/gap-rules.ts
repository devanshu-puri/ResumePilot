import { StoredEvidenceRecord } from "../services/evidence-service";

export const GAP_RULE_VERSION = "v1";
export const GAP_THRESHOLD = 0.6; // Ratio < 0.6 on interview criterion is considered weak
export const PASS_THRESHOLD = 0.7; // Ratio >= 0.7 is passing

export interface DerivedGap {
  topicId: string;
  gapRuleVersion: string;
  evidenceIds: string[];
  criterionIds: string[];
  latestRatios: number[];
  retestEligible: boolean;
  openedAt: Date;
}

export interface BeforeAfterEvidence {
  topicId: string;
  comparable: boolean;
  before: { ratio: number; observedAt: Date; sourceId: string }[];
  after: { ratio: number; observedAt: Date; sourceId: string }[];
  rawSummary?: string;
}

/**
 * Pure function: computes open gaps from append-only evidence rows (EVD-T2, blueprint §4).
 *
 * Rules:
 * 1. An individual observation is NEVER called a gap (PRD EVD-2).
 * 2. An open gap requires >= 2 interview-source evidence rows for the topic where the
 *    latest 2 consecutive rows each have ratio < GAP_THRESHOLD (0.6).
 * 3. A subsequent passing observation (ratio >= PASS_THRESHOLD 0.7) closes the gap.
 * 4. Retest eligible: a library activity attempt for the topic reached passed after the gap opened.
 */
export function computeGaps(
  evidenceList: StoredEvidenceRecord[],
  ruleVersion = GAP_RULE_VERSION
): DerivedGap[] {
  if (!evidenceList || evidenceList.length === 0) return [];

  // Group evidence by topic
  const byTopic = new Map<string, StoredEvidenceRecord[]>();
  for (const row of evidenceList) {
    const list = byTopic.get(row.topicId) || [];
    list.push(row);
    byTopic.set(row.topicId, list);
  }

  const openGaps: DerivedGap[] = [];

  for (const [topicId, rows] of Array.from(byTopic.entries())) {
    // Sort chronological: oldest first
    const sorted = [...rows].sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

    const interviewRows = sorted.filter((r) => r.sourceType === "interview_criterion");

    // Need at least 2 interview observations to form a gap
    if (interviewRows.length < 2) continue;

    // Check latest 2 interview rows
    const latestTwo = interviewRows.slice(-2);
    const bothLow = latestTwo.every((r) => r.ratio < GAP_THRESHOLD);

    if (!bothLow) continue;

    // Check if any later interview row passes (ratio >= PASS_THRESHOLD)
    const gapOpenedAt = latestTwo[1].observedAt;
    const laterPass = interviewRows.some(
      (r) => r.observedAt > gapOpenedAt && r.ratio >= PASS_THRESHOLD
    );

    if (laterPass) {
      // Gap closed by later passing evidence
      continue;
    }

    // Check if retest eligible: an activity attempt reached passed after gap opened
    const retestEligible = sorted.some(
      (r) =>
        r.sourceType === "activity_attempt" &&
        r.observedAt >= gapOpenedAt &&
        r.ratio >= PASS_THRESHOLD
    );

    openGaps.push({
      topicId,
      gapRuleVersion: ruleVersion,
      evidenceIds: latestTwo.map((r) => r.id),
      criterionIds: latestTwo.map((r) => r.criterionId).filter(Boolean) as string[],
      latestRatios: latestTwo.map((r) => r.ratio),
      retestEligible,
      openedAt: gapOpenedAt,
    });
  }

  return openGaps;
}

/**
 * Computes comparable before/after evidence (EVD-T6).
 * Hidden unless comparable evidence exists on both sides.
 * Never displays unexplained '+X% mastery' percentages (Invariant I-01).
 */
export function computeBeforeAfter(
  topicId: string,
  evidenceList: StoredEvidenceRecord[]
): BeforeAfterEvidence {
  const topicRows = evidenceList
    .filter((r) => r.topicId === topicId)
    .sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

  const interviewRows = topicRows.filter((r) => r.sourceType === "interview_criterion");
  const activityRows = topicRows.filter((r) => r.sourceType === "activity_attempt");

  // Need at least 1 interview and 1 subsequent activity/retest row
  if (interviewRows.length === 0 || activityRows.length === 0) {
    return {
      topicId,
      comparable: false,
      before: [],
      after: [],
    };
  }

  const before = interviewRows.map((r) => ({
    ratio: r.ratio,
    observedAt: r.observedAt,
    sourceId: r.sourceId,
  }));

  const after = activityRows.map((r) => ({
    ratio: r.ratio,
    observedAt: r.observedAt,
    sourceId: r.sourceId,
  }));

  const beforeRatiosStr = before.map((b) => b.ratio.toFixed(2)).join(", ");
  const afterRatiosStr = after.map((a) => a.ratio.toFixed(2)).join(", ");

  return {
    topicId,
    comparable: true,
    before,
    after,
    rawSummary: `Prior evaluations: [${beforeRatiosStr}] → Practice attempts: [${afterRatiosStr}]`,
  };
}
