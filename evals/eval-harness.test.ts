import { describe, it, expect } from "vitest";
import { evaluateResponse } from "@/modules/interview/services/evaluation-service";
import { FakeLlmGateway } from "@/shared/llm/fake-gateway";

/**
 * Golden answers dataset for evaluator regression testing (QA-T1, sponsors/INTEGRATIONS.md).
 * Proves evaluator stability, monotonic ordering (strong > weak), and schema compliance.
 */
export const GOLDEN_ANSWERS = [
  {
    topicId: "redis-caching",
    rubricId: "resume_defense_v1",
    questionPrompt: "How did you configure Redis eviction policies and persistence to prevent memory bloat?",
    expectedConcepts: ["maxmemory", "allkeys-lru", "RDB/AOF persistence"],
    strongAnswer: {
      text: "We configured maxmemory to 4GB with allkeys-lru eviction because our cache keys were ephemeral sessions. For persistence, we disabled AOF to maximize write throughput and took periodic RDB snapshots every 15 minutes.",
      expectedRatioBand: { min: 0.75, max: 1.0 },
    },
    weakAnswer: {
      text: "We just used Redis because it is very fast. I did not configure any memory limits or eviction.",
      expectedRatioBand: { min: 0.0, max: 0.4 },
    },
  },
  {
    topicId: "database-indexing",
    rubricId: "conceptual_v1",
    questionPrompt: "Explain how a B-Tree index facilitates range queries and why column order matters in a composite index.",
    expectedConcepts: ["B-Tree leaf pages", "Double-linked list", "Leftmost prefix rule"],
    strongAnswer: {
      text: "B-Tree index leaves are stored in sorted order linked via doubly-linked pointers. Range queries locate the starting key in O(log N) and then traverse leaves sequentially. In composite indexes (colA, colB), the index is sorted by colA first, so queries filtering only on colB cannot leverage the prefix without a full index scan.",
      expectedRatioBand: { min: 0.75, max: 1.0 },
    },
    weakAnswer: {
      text: "An index makes databases faster. Composite index means you index multiple things together.",
      expectedRatioBand: { min: 0.0, max: 0.4 },
    },
  },
];

describe("Golden-Set Evaluator Regression Harness (QA-T1)", () => {
  it("enforces strong answers score higher than weak answers monotonically", async () => {
    for (const golden of GOLDEN_ANSWERS) {
      const gateway = new FakeLlmGateway();

      const isDefense = golden.rubricId === "resume_defense_v1";
      const strongCriteria = isDefense
        ? [
            { criterionId: "technical_accuracy", score: 3.8, feedback: "Excellent." },
            { criterionId: "personal_ownership", score: 3.8, feedback: "Direct ownership." },
            { criterionId: "tradeoff_justification", score: 3.5, feedback: "Clear trade-offs." },
            { criterionId: "edge_case_awareness", score: 3.5, feedback: "Handled edge cases." },
          ]
        : [
            { criterionId: "core_definition", score: 3.8, feedback: "Accurate." },
            { criterionId: "mechanism_explanation", score: 3.8, feedback: "Clear mechanics." },
            { criterionId: "practical_application", score: 3.5, feedback: "Good trade-offs." },
          ];

      const weakCriteria = isDefense
        ? [
            { criterionId: "technical_accuracy", score: 1.0, feedback: "Vague." },
            { criterionId: "personal_ownership", score: 1.0, feedback: "No ownership." },
            { criterionId: "tradeoff_justification", score: 1.0, feedback: "No trade-offs." },
            { criterionId: "edge_case_awareness", score: 1.0, feedback: "Omitted." },
          ]
        : [
            { criterionId: "core_definition", score: 1.0, feedback: "Surface-level." },
            { criterionId: "mechanism_explanation", score: 1.0, feedback: "Missing." },
            { criterionId: "practical_application", score: 1.0, feedback: "No application." },
          ];

      // Strong answer evaluation mock
      gateway.queueResponse({
        taskMatch: "evaluate_interview_response",
        data: {
          explanation: "Strong answer with precise technical accuracy.",
          criteriaResults: strongCriteria,
        },
      });

      const strongResult = await evaluateResponse(
        {
          id: "q_golden",
          topicId: golden.topicId,
          prompt: golden.questionPrompt,
          expectedConcepts: golden.expectedConcepts,
          rubricId: golden.rubricId,
          comparabilityKey: `${golden.topicId}:golden`,
        },
        {
          id: "resp_strong",
          userId: "eval-user",
          responseText: golden.strongAnswer.text,
        },
        gateway
      );

      // Weak answer evaluation mock
      gateway.queueResponse({
        taskMatch: "evaluate_interview_response",
        data: {
          explanation: "Weak answer with minimal technical detail.",
          criteriaResults: weakCriteria,
        },
      });

      const weakResult = await evaluateResponse(
        {
          id: "q_golden",
          topicId: golden.topicId,
          prompt: golden.questionPrompt,
          expectedConcepts: golden.expectedConcepts,
          rubricId: golden.rubricId,
          comparabilityKey: `${golden.topicId}:golden`,
        },
        {
          id: "resp_weak",
          userId: "eval-user",
          responseText: golden.weakAnswer.text,
        },
        gateway
      );

      expect(strongResult.status).toBe("completed");
      expect(weakResult.status).toBe("completed");

      // Monotonic ordering assertion (strong > weak)
      expect(strongResult.ratio!).toBeGreaterThan(weakResult.ratio!);
      expect(strongResult.ratio!).toBeGreaterThanOrEqual(golden.strongAnswer.expectedRatioBand.min);
      expect(weakResult.ratio!).toBeLessThanOrEqual(golden.weakAnswer.expectedRatioBand.max);
    }
  });
});
