import { describe, it, expect, beforeEach } from "vitest";
import {
  computeGaps,
  computeBeforeAfter,
  GAP_THRESHOLD,
  PASS_THRESHOLD,
} from "@/modules/evidence/domain/gap-rules";
import {
  createHandoffDto,
  matchResourcesForGap,
  selectRetestQuestion,
} from "@/modules/evidence/domain/handoff-retest";
import { computeNextBestAction } from "@/modules/evidence/domain/next-best-action";
import { evidenceService, StoredEvidenceRecord } from "@/modules/evidence/services/evidence-service";
import { SEED_LIBRARY_RESOURCES } from "@/content/library-seed";
import { DEMO_USER_A, DEMO_USER_B } from "@/shared/auth/user";

describe("Evidence Loop & Connector (EVD-T2, EVD-T3, EVD-T4, EVD-T5, EVD-T6, EVD-T7, EVD-T8)", () => {
  beforeEach(() => {
    evidenceService._clearMemory();
  });

  describe("Gap Rule v1 (EVD-T2)", () => {
    it("does NOT classify a single low score observation as a gap", () => {
      const singleObservation: StoredEvidenceRecord = {
        id: "evd_1",
        userId: "user-1",
        topicId: "redis-caching",
        sourceType: "interview_criterion",
        sourceId: "eval_1",
        ratio: 0.35, // below 0.6
        comparabilityKey: "redis-caching:v1",
        rubricVersion: "v1",
        observedAt: new Date(2026, 9, 20),
      };

      const gaps = computeGaps([singleObservation]);
      expect(gaps.length).toBe(0);
    });

    it("detects an open gap when 2 consecutive interview rows score below 0.60", () => {
      const rows: StoredEvidenceRecord[] = [
        {
          id: "evd_1",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_1",
          ratio: 0.4,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 20),
        },
        {
          id: "evd_2",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_2",
          ratio: 0.5,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 21),
        },
      ];

      const gaps = computeGaps(rows);
      expect(gaps.length).toBe(1);
      expect(gaps[0].topicId).toBe("redis-caching");
      expect(gaps[0].retestEligible).toBe(false);
    });

    it("closes open gap when a subsequent interview row passes (ratio >= 0.70)", () => {
      const rows: StoredEvidenceRecord[] = [
        {
          id: "evd_1",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_1",
          ratio: 0.4,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 20),
        },
        {
          id: "evd_2",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_2",
          ratio: 0.5,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 21),
        },
        {
          id: "evd_3",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_3",
          ratio: 0.85, // Passing score closes gap
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 22),
        },
      ];

      const gaps = computeGaps(rows);
      expect(gaps.length).toBe(0);
    });

    it("marks gap as retest eligible when an activity passes after gap opened", () => {
      const rows: StoredEvidenceRecord[] = [
        {
          id: "evd_1",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_1",
          ratio: 0.4,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 20),
        },
        {
          id: "evd_2",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "interview_criterion",
          sourceId: "eval_2",
          ratio: 0.5,
          comparabilityKey: "redis-caching:v1",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 21),
        },
        {
          id: "evd_3",
          userId: "user-1",
          topicId: "redis-caching",
          sourceType: "activity_attempt",
          sourceId: "att_1",
          ratio: 0.9, // Passed activity attempt
          comparabilityKey: "redis-caching:act",
          rubricVersion: "v1",
          observedAt: new Date(2026, 9, 22),
        },
      ];

      const gaps = computeGaps(rows);
      expect(gaps.length).toBe(1);
      expect(gaps[0].retestEligible).toBe(true);
    });
  });

  describe("Handoff DTO Privacy Leak Test (EVD-T4, Invariant I-11)", () => {
    it("ensures HandoffDto contains strictly IDs and enums without candidate answer text", () => {
      const gap = {
        topicId: "redis-caching",
        gapRuleVersion: "v1",
        evidenceIds: ["evd_1", "evd_2"],
        criterionIds: ["crit_1", "crit_2"],
        latestRatios: [0.4, 0.5],
        retestEligible: true,
        openedAt: new Date(),
      };

      const dto = createHandoffDto(gap);

      expect(dto.topicId).toBe("redis-caching");
      expect(dto.evidenceIds).toEqual(["evd_1", "evd_2"]);
      expect(dto.criterionIds).toEqual(["crit_1", "crit_2"]);

      // Verify no text fields exist on DTO
      expect((dto as any).text).toBeUndefined();
      expect((dto as any).answer).toBeUndefined();
      expect((dto as any).response).toBeUndefined();
      expect((dto as any).quote).toBeUndefined();
    });
  });

  describe("Resource Matching & Retest Selection (EVD-T3, EVD-T5)", () => {
    it("ranks matching resources with exact topic match and practice activities first", () => {
      const gap = {
        topicId: "redis-caching",
        gapRuleVersion: "v1",
        evidenceIds: ["e1", "e2"],
        criterionIds: ["c1"],
        latestRatios: [0.4, 0.5],
        retestEligible: false,
        openedAt: new Date(),
      };

      const matched = matchResourcesForGap(gap, SEED_LIBRARY_RESOURCES);
      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].slug).toBe("redis-caching-patterns");
      expect(matched[0].activities.length).toBeGreaterThan(0);
    });

    it("selects comparable retest question and never returns an answered question id", () => {
      const questionBank = [
        {
          id: "q_redis_1",
          topicId: "redis-caching",
          comparabilityKey: "redis-caching:defense:intermediate",
          prompt: "Question 1",
          questionType: "resume_defense" as const,
          expectedConcepts: ["c1"],
          rubricId: "resume_defense_v1",
          rubricVersion: "v1",
          difficulty: "intermediate",
          estimatedDurationSeconds: 300,
        },
        {
          id: "q_redis_2",
          topicId: "redis-caching",
          comparabilityKey: "redis-caching:defense:intermediate",
          prompt: "Question 2",
          questionType: "resume_defense" as const,
          expectedConcepts: ["c2"],
          rubricId: "resume_defense_v1",
          rubricVersion: "v1",
          difficulty: "intermediate",
          estimatedDurationSeconds: 300,
        },
      ];

      // If q_redis_1 was already answered
      const answered = new Set(["q_redis_1"]);
      const retest = selectRetestQuestion(
        "redis-caching",
        "redis-caching:defense:intermediate",
        answered,
        questionBank
      );

      expect(retest).not.toBeNull();
      expect(retest?.id).toBe("q_redis_2");

      // If all answered, returns null
      answered.add("q_redis_2");
      const noneLeft = selectRetestQuestion(
        "redis-caching",
        "redis-caching:defense:intermediate",
        answered,
        questionBank
      );
      expect(noneLeft).toBeNull();
    });
  });

  describe("Before/After View (EVD-T6)", () => {
    it("is marked comparable only when both prior interview and subsequent activity rows exist", () => {
      const interviewRow: StoredEvidenceRecord = {
        id: "evd_1",
        userId: "user-1",
        topicId: "redis-caching",
        sourceType: "interview_criterion",
        sourceId: "eval_1",
        ratio: 0.4,
        comparabilityKey: "redis-caching:v1",
        rubricVersion: "v1",
        observedAt: new Date(2026, 9, 20),
      };

      // Only interview evidence -> not comparable yet
      const notComparable = computeBeforeAfter("redis-caching", [interviewRow]);
      expect(notComparable.comparable).toBe(false);

      // Add activity attempt -> comparable!
      const activityRow: StoredEvidenceRecord = {
        id: "evd_2",
        userId: "user-1",
        topicId: "redis-caching",
        sourceType: "activity_attempt",
        sourceId: "att_1",
        ratio: 0.85,
        comparabilityKey: "redis-caching:v1",
        rubricVersion: "v1",
        observedAt: new Date(2026, 9, 22),
      };

      const comparable = computeBeforeAfter("redis-caching", [interviewRow, activityRow]);
      expect(comparable.comparable).toBe(true);
      expect(comparable.before.length).toBe(1);
      expect(comparable.after.length).toBe(1);
      expect(comparable.rawSummary).toContain("Prior evaluations: [0.40] → Practice attempts: [0.85]");
    });
  });

  describe("Home Next-Best-Action Engine (EVD-T7)", () => {
    it("recommends resuming session if in_progress session exists", () => {
      const nba = computeNextBestAction({
        hasResume: true,
        unreviewedClaimsCount: 0,
        confirmedClaimsCount: 3,
        activeSessionId: "sess_123",
        activeSessionStatus: "in_progress",
        openGaps: [],
      });

      expect(nba.actionType).toBe("resume_session");
      expect(nba.because).toContain("sess_123");
    });

    it("recommends reviewing claims if unreviewed claims exist", () => {
      const nba = computeNextBestAction({
        hasResume: true,
        unreviewedClaimsCount: 4,
        confirmedClaimsCount: 1,
        openGaps: [],
      });

      expect(nba.actionType).toBe("review_claims");
      expect(nba.because).toContain("4 pending unreviewed claims");
    });

    it("recommends retest if a gap is marked retestEligible", () => {
      const nba = computeNextBestAction({
        hasResume: true,
        unreviewedClaimsCount: 0,
        confirmedClaimsCount: 3,
        openGaps: [
          {
            topicId: "redis-caching",
            gapRuleVersion: "v1",
            evidenceIds: ["e1"],
            criterionIds: ["c1"],
            latestRatios: [0.4],
            retestEligible: true,
            openedAt: new Date(),
          },
        ],
      });

      expect(nba.actionType).toBe("retest_topic");
      expect(nba.because).toContain("passed a practice activity for 'redis-caching'");
    });

    it("recommends uploading resume on cold start", () => {
      const nba = computeNextBestAction({
        hasResume: false,
        unreviewedClaimsCount: 0,
        confirmedClaimsCount: 0,
        openGaps: [],
      });

      expect(nba.actionType).toBe("upload_resume");
      expect(nba.because).toContain("no active resume has been uploaded");
    });
  });

  describe("Cross-User Isolation (EVD-T8)", () => {
    it("never leaks evidence across users", async () => {
      await evidenceService.appendEvidence({
        userId: DEMO_USER_A.id,
        topicId: "redis-caching",
        sourceType: "interview_criterion",
        sourceId: "eval_A",
        ratio: 0.45,
        comparabilityKey: "key_A",
      });

      const userAEvidence = await evidenceService.getTopicEvidence(DEMO_USER_A.id, "redis-caching");
      expect(userAEvidence.length).toBe(1);

      const userBEvidence = await evidenceService.getTopicEvidence(DEMO_USER_B.id, "redis-caching");
      expect(userBEvidence.length).toBe(0);
    });
  });
});
