import { describe, it, expect } from "vitest";
import { z } from "zod";
import { FakeLlmGateway } from "@/shared/llm/fake-gateway";

const SampleEvaluationSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0).max(4),
  feedback: z.string(),
});

describe("LLM Gateway Contract & Fake (FND-T7)", () => {
  it("completes valid schema-bounded requests", async () => {
    const gateway = new FakeLlmGateway();
    gateway.queueResponse({
      taskMatch: "evaluate_criterion",
      data: {
        criterionId: "c1",
        score: 3.5,
        feedback: "Solid understanding of Redis data structures.",
      },
    });

    const result = await gateway.complete({
      task: "evaluate_criterion",
      input: { answer: "We used hashes to store user tokens." },
      schema: SampleEvaluationSchema,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.criterionId).toBe("c1");
      expect(result.data.score).toBe(3.5);
      expect(result.data.feedback).toContain("Redis");
    }
    expect(gateway.callCount).toBe(1);
  });

  it("handles malformed schema gracefully without throwing", async () => {
    const gateway = new FakeLlmGateway();
    gateway.queueResponse({
      taskMatch: "evaluate_criterion",
      data: {
        criterionId: "c1",
        score: 99, // exceeds max 4
        feedback: "Invalid score",
      },
    });

    const result = await gateway.complete({
      task: "evaluate_criterion",
      input: "test answer",
      schema: SampleEvaluationSchema,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("Schema validation failed");
      expect(result.retryable).toBe(true);
    }
  });

  it("handles simulated provider outage or timeouts", async () => {
    const gateway = new FakeLlmGateway();
    gateway.queueResponse({
      taskMatch: "question_generation",
      failReason: "Connection refused by LLM inference server",
      retryable: true,
    });

    const result = await gateway.complete({
      task: "question_generation",
      input: "generate questions",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("Connection refused");
      expect(result.retryable).toBe(true);
    }
  });
});
