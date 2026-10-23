import { describe, it, expect, beforeEach } from "vitest";
import {
  nextAttemptNumber,
  evaluateKnowledgeCheck,
  computeResourceProgress,
} from "@/modules/library/domain/completion-rules";
import { validateLibrarySeed, LearningResourceSchema } from "@/modules/library/domain/content-validator";
import { libraryService } from "@/modules/library/services/library-service";
import { SEED_LIBRARY_RESOURCES } from "@/content/library-seed";
import { DEMO_USER_A, DEMO_USER_B } from "@/shared/auth/user";
import { evidenceService } from "@/modules/evidence/services/evidence-service";

describe("Tech Library & Practice Studio (LIB-T2, LIB-T4, LIB-T5, LIB-T7, LIB-T9)", () => {
  beforeEach(() => {
    libraryService._clearMemory();
    evidenceService._clearMemory();
  });

  describe("Content Validation (LIB-T2)", () => {
    it("validates seed resources and ensures all have attribution and objectives with topics", () => {
      expect(SEED_LIBRARY_RESOURCES.length).toBeGreaterThanOrEqual(4);

      for (const res of SEED_LIBRARY_RESOURCES) {
        expect(res.canonicalUrl).toMatch(/^https?:\/\//);
        expect(res.attribution.length).toBeGreaterThan(0);
        expect(res.objectives.length).toBeGreaterThan(0);
        for (const obj of res.objectives) {
          expect(obj.topicSlug.length).toBeGreaterThan(0);
        }
      }
    });

    it("fails validation when a resource lacks attribution or valid canonical URL", () => {
      const invalidResource = {
        slug: "bad-res",
        title: "Bad Resource",
        description: "Missing attribution",
        resourceType: "concept_guide",
        canonicalUrl: "not-a-valid-url",
        attribution: "", // empty attribution
        internalNotes: "Valid notes here for testing.",
        topicSlugs: ["react"],
        objectives: [{ topicSlug: "react", description: "Learn React." }],
      };

      expect(() => LearningResourceSchema.parse(invalidResource)).toThrow();
    });
  });

  describe("Attempt Numbering & Deterministic Evaluation (LIB-T4, LIB-T5)", () => {
    it("computes next attempt number as max + 1 strictly positive", () => {
      expect(nextAttemptNumber([])).toBe(1);
      expect(nextAttemptNumber([{ attemptNumber: 1 }])).toBe(2);
      expect(nextAttemptNumber([{ attemptNumber: 1 }, { attemptNumber: 4 }])).toBe(5);
    });

    it("evaluates knowledge_check deterministically in code", () => {
      const questions = [
        {
          id: "q1",
          text: "What is 2+2?",
          options: [
            { id: "o1", text: "3", isCorrect: false },
            { id: "o2", text: "4", isCorrect: true },
          ],
        },
        {
          id: "q2",
          text: "What is the capital of France?",
          options: [
            { id: "o3", text: "Paris", isCorrect: true },
            { id: "o4", text: "London", isCorrect: false },
          ],
        },
      ];

      // Both correct -> 100% -> passed
      const perfect = evaluateKnowledgeCheck(questions, { q1: "o2", q2: "o3" });
      expect(perfect.score).toBe(2);
      expect(perfect.maxScore).toBe(2);
      expect(perfect.ratio).toBe(1.0);
      expect(perfect.status).toBe("passed");

      // One correct (50%) -> below 80% policy -> needs_review
      const partial = evaluateKnowledgeCheck(questions, { q1: "o2", q2: "o4" });
      expect(partial.score).toBe(1);
      expect(partial.ratio).toBe(0.5);
      expect(partial.status).toBe("needs_review");
    });

    it("computes resource progress status according to explicit policy (Invariant I-10)", () => {
      // 0 attempts -> in_progress if started, not_started if not
      expect(computeResourceProgress(false, [], 1)).toBe("not_started");
      expect(computeResourceProgress(true, [], 1)).toBe("in_progress");

      // Passing attempt satisfies policy -> completed
      const passedAttempt = {
        id: "att_1",
        activityId: "act_1",
        attemptNumber: 1,
        score: 4,
        maxScore: 4,
        ratio: 1.0,
        status: "passed" as const,
      };
      expect(computeResourceProgress(true, [passedAttempt], 1)).toBe("completed");
    });
  });

  describe("Attempt Submission & Evidence Write (LIB-T7, LIB-T9)", () => {
    it("submits attempt, numbers it, updates progress, and writes TopicEvidence", async () => {
      const attempt = await libraryService.submitAttempt(
        DEMO_USER_A.id,
        "act_redis_kc_1",
        {
          selectedOptions: {
            q1: "opt_a", // correct
            q2: "opt_2b", // correct
          },
        }
      );

      expect(attempt.attemptNumber).toBe(1);
      expect(attempt.status).toBe("passed");
      expect(attempt.ratio).toBe(1.0);

      // Verify progress updated
      const resource = await libraryService.getResource("redis-caching-patterns", DEMO_USER_A.id);
      expect(resource.userProgress).toBe("completed");

      // Verify TopicEvidence written to ledger
      const evidence = await evidenceService.getTopicEvidence(DEMO_USER_A.id, "redis-caching");
      expect(evidence.length).toBeGreaterThan(0);
      expect(evidence[0].sourceType).toBe("activity_attempt");
      expect(evidence[0].ratio).toBe(1.0);
    });

    it("isolates user attempts and saved lists across different users (LIB-T9)", async () => {
      // User A saves resource
      await libraryService.toggleSave(DEMO_USER_A.id, "redis-caching-patterns");

      const resUserA = await libraryService.getResource("redis-caching-patterns", DEMO_USER_A.id);
      expect(resUserA.isSaved).toBe(true);

      // User B should not see it as saved
      const resUserB = await libraryService.getResource("redis-caching-patterns", DEMO_USER_B.id);
      expect(resUserB.isSaved).toBe(false);
    });
  });
});
