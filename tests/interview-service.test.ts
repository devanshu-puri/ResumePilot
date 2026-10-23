import { describe, it, expect, beforeEach } from "vitest";
import { interviewService } from "@/modules/interview/services/interview-service";
import { FakeLlmGateway } from "@/shared/llm/fake-gateway";
import { DEMO_USER_A, DEMO_USER_B } from "@/shared/auth/user";
import { validateNoHallucinatedTech, validateNoDuplicateQuestion } from "@/modules/interview/services/question-generator";
import { AppError } from "@/shared/errors/app-error";
import { evidenceService } from "@/modules/evidence/services/evidence-service";

describe("Interview Service, Generation, Evaluation & Auth (INT-T5, INT-T6, INT-T7, INT-T8, INT-T9, INT-T11)", () => {
  let fakeGateway: FakeLlmGateway;

  beforeEach(() => {
    interviewService._clearMemory();
    evidenceService._clearMemory();

    fakeGateway = new FakeLlmGateway();
    // Default question generation response
    fakeGateway.queueResponse({
      taskMatch: "question_generation",
      data: {
        prompt: "How did you design the Redis cluster cache-invalidation policy to avoid stale reads?",
        expectedConcepts: ["Cache invalidation", "TTL expiration", "Pub/sub event notification"],
        questionType: "resume_defense",
        estimatedDurationSeconds: 300,
      },
    });

    // Default evaluation response
    fakeGateway.queueResponse({
      taskMatch: "evaluate_interview_response",
      data: {
        explanation: "Clear technical description of invalidation patterns.",
        criteriaResults: [
          {
            criterionId: "technical_accuracy",
            score: 3.5,
            evidenceQuote: "We used Redis TTL and Pub/Sub events",
            feedback: "Detailed explanation of Redis event mechanics.",
          },
          {
            criterionId: "personal_ownership",
            score: 4.0,
            feedback: "Demonstrated direct ownership of cluster config.",
          },
          {
            criterionId: "tradeoff_justification",
            score: 3.0,
            feedback: "Good comparison with write-through cache.",
          },
          {
            criterionId: "edge_case_awareness",
            score: 3.5,
            feedback: "Covered network partition handling.",
          },
        ],
      },
    });

    // @ts-expect-error test gateway injection
    interviewService.gateway = fakeGateway;
  });

  it("rejects hallucinated technology in generated questions (INT-T5)", () => {
    const prompt = "Explain how you deployed Kubernetes Pods and Helm charts for this project.";
    const allowedClaimContext = "Implemented Redis caching cluster in Node.js.";

    expect(() => validateNoHallucinatedTech(prompt, allowedClaimContext)).toThrow(AppError);
    expect(() => validateNoHallucinatedTech(prompt, allowedClaimContext)).toThrowError(/hallucinated technology 'kubernetes'/i);
  });

  it("rejects duplicate questions within session with identical concept sets (INT-T5)", () => {
    const existing = [
      {
        topicSlug: "redis-caching",
        expectedConcepts: ["eviction", "TTL", "persistence"],
      },
    ];

    expect(() =>
      validateNoDuplicateQuestion("redis-caching", ["persistence", "TTL", "eviction"], existing)
    ).toThrow(AppError);
  });

  it("creates session and generates grounded defense questions (INT-1, INT-2)", async () => {
    const session = await interviewService.createSession(DEMO_USER_A.id, {
      sessionType: "defense",
      targetRole: "Senior Backend Engineer",
      claims: [
        {
          claimText: "Architected Redis cluster caching.",
          topicSlug: "redis-caching",
          topicName: "Redis Caching",
        },
      ],
    });

    expect(session.id).toBeDefined();
    expect(session.status).toBe("in_progress");
    expect(session.questions.length).toBe(1);
    expect(session.questions[0].topicId).toBe("redis-caching");
    expect(session.questions[0].prompt).toContain("Redis");
  });

  it("rejects empty or whitespace answers without persisting attempt (INT-T6)", async () => {
    const session = await interviewService.createSession(DEMO_USER_A.id, {
      sessionType: "challenge",
      targetRole: "Backend Engineer",
      topicSlugs: ["redis-caching"],
    });

    const questionId = session.questions[0].id;

    await expect(
      interviewService.submitResponse(DEMO_USER_A.id, session.id, questionId, "   \n\t  ")
    ).rejects.toThrow(AppError);

    // No response persisted
    const updated = await interviewService.getSession(DEMO_USER_A.id, session.id);
    expect(updated.responses.length).toBe(0);
  });

  it("evaluates answer, computes score in code, and writes evidence ledger (INT-T7, INT-T8)", async () => {
    const session = await interviewService.createSession(DEMO_USER_A.id, {
      sessionType: "defense",
      targetRole: "Backend Engineer",
      claims: [
        {
          claimText: "Architected Redis cluster caching.",
          topicSlug: "redis-caching",
          topicName: "Redis Caching",
        },
      ],
    });

    const questionId = session.questions[0].id;
    const answer = "We used Redis TTL and Pub/Sub events to notify microservices whenever data changed.";

    const { evaluation } = await interviewService.submitResponse(
      DEMO_USER_A.id,
      session.id,
      questionId,
      answer
    );

    expect(evaluation.status).toBe("completed");
    expect(evaluation.totalScore).toBe(14.0); // 3.5 + 4.0 + 3.0 + 3.5
    expect(evaluation.maxScore).toBe(16.0);
    expect(evaluation.ratio).toBe(0.875);

    // Verify evidence written to ledger
    const evidenceList = await evidenceService.getTopicEvidence(DEMO_USER_A.id, "redis-caching");
    expect(evidenceList.length).toBe(4); // 4 criteria evaluated
    expect(evidenceList[0].sourceType).toBe("interview_criterion");
  });

  it("generates follow-up linked to triggering response (INT-T9)", async () => {
    fakeGateway.queueResponse({
      taskMatch: "generate_follow_up",
      data: {
        followUpType: "edge_case",
        prompt: "What happens if a network split occurs between the Redis primary and replica?",
        rationale: "Candidate scored well on basic invalidation, now testing partition resilience.",
        expectedConcepts: ["Split-brain", "Sentinel quorum", "Replication lag"],
      },
    });

    const session = await interviewService.createSession(DEMO_USER_A.id, {
      sessionType: "challenge",
      targetRole: "Backend Engineer",
      topicSlugs: ["redis-caching"],
    });

    const qId = session.questions[0].id;
    const { response } = await interviewService.submitResponse(
      DEMO_USER_A.id,
      session.id,
      qId,
      "We used Redis TTL and Pub/Sub events for cache invalidation."
    );

    const followUp = await interviewService.triggerFollowUp(
      DEMO_USER_A.id,
      session.id,
      response.id
    );

    expect(followUp).not.toBeNull();
    expect(followUp?.parentQuestionId).toBe(qId);
    expect(followUp?.triggeringResponseId).toBe(response.id);
    expect(followUp?.followUpType).toBe("edge_case");
  });

  it("prevents User B from accessing User A's interview session (INT-T11)", async () => {
    const session = await interviewService.createSession(DEMO_USER_A.id, {
      sessionType: "challenge",
      targetRole: "Engineer",
      topicSlugs: ["redis-caching"],
    });

    await expect(
      interviewService.getSession(DEMO_USER_B.id, session.id)
    ).rejects.toThrow(AppError);
  });
});
