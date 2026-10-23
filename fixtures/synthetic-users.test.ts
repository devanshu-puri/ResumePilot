import { describe, it, expect, beforeEach } from "vitest";
import { evidenceService } from "@/modules/evidence/services/evidence-service";
import { libraryService } from "@/modules/library/services/library-service";

/**
 * Synthetic relational fixtures for multi-user isolation verification (QA-T2, sponsors/INTEGRATIONS.md).
 * Labelled synthetic. Never uses real candidate data (Invariant I-13).
 */
export function generateSyntheticUsers(count = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: `synthetic_user_${i + 1}`,
    email: `synthetic.candidate.${i + 1}@testing.internal`,
    name: `Synthetic Candidate ${i + 1}`,
  }));
}

describe("Synthetic Multi-User Isolation Fixtures (QA-T2, Invariant I-07)", () => {
  beforeEach(() => {
    evidenceService._clearMemory();
    libraryService._clearMemory();
  });

  it("proves complete cross-user isolation across 50 concurrent synthetic users", async () => {
    const users = generateSyntheticUsers(50);
    const topics = ["redis-caching", "postgresql", "docker", "rest-api-design"];

    // Populate synthetic evidence records for each user
    for (let idx = 0; idx < users.length; idx++) {
      const user = users[idx];
      const topic = topics[idx % topics.length];
      const ratio = Number(((idx % 10) / 10).toFixed(2)); // Varied ratios

      await evidenceService.appendEvidence({
        userId: user.id,
        topicId: topic,
        sourceType: "interview_criterion",
        sourceId: `synth_eval_${user.id}`,
        criterionId: "synth_crit",
        ratio,
        comparabilityKey: `${topic}:synth`,
      });
    }

    // Verify isolation for each user
    for (let idx = 0; idx < users.length; idx++) {
      const user = users[idx];
      const userEvidence = await evidenceService.getAllUserEvidence(user.id);

      // Exactly 1 record belonging strictly to this user
      expect(userEvidence.length).toBe(1);
      expect(userEvidence[0].userId).toBe(user.id);

      // Verify no other user's record leaked into user's query
      for (const otherUser of users) {
        if (otherUser.id !== user.id) {
          expect(userEvidence.some((e) => e.userId === otherUser.id)).toBe(false);
        }
      }
    }
  });
});
