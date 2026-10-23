import { describe, it, expect, beforeEach } from "vitest";
import { resumeService } from "@/modules/resume/services/resume-service";
import { interviewService } from "@/modules/interview/services/interview-service";
import { libraryService } from "@/modules/library/services/library-service";
import { evidenceService } from "@/modules/evidence/services/evidence-service";
import { computeGaps, computeBeforeAfter } from "@/modules/evidence/domain/gap-rules";
import { computeNextBestAction } from "@/modules/evidence/domain/next-best-action";
import { matchResourcesForGap, selectRetestQuestion, createHandoffDto } from "@/modules/evidence/domain/handoff-retest";
import { FakeLlmGateway } from "@/shared/llm/fake-gateway";
import { DEMO_USER_A } from "@/shared/auth/user";

describe("End-to-End User Journeys 1–5 (QA-T3)", () => {
  const userId = DEMO_USER_A.id;
  let fakeGateway: FakeLlmGateway;

  const candidateResume = `
SUMMARY
Software developer with focus on backend distributed systems.

EXPERIENCE
CloudScale Systems
- Architected a distributed caching layer with Redis clusters, reducing DB latency by 45%.
- Implemented PostgreSQL database indexing and partition strategies.

SKILLS
Redis, PostgreSQL, Docker, TypeScript
`;

  beforeEach(() => {
    resumeService._clearMemory();
    interviewService._clearMemory();
    libraryService._clearMemory();
    evidenceService._clearMemory();

    fakeGateway = new FakeLlmGateway();

    // 1. Structuring Mock
    fakeGateway.queueResponse({
      taskMatch: "resume_structuring",
      data: {
        sections: [{ sectionType: "experience", title: "EXPERIENCE" }],
        projects: [{ title: "CloudScale Systems", description: "Backend work" }],
        skills: ["Redis", "PostgreSQL", "Docker", "TypeScript"],
        claims: [
          {
            claimType: "performance_optimization",
            claimText: "Architected a distributed caching layer with Redis clusters, reducing DB latency by 45%.",
            quoteText: "Architected a distributed caching layer with Redis clusters, reducing DB latency by 45%.",
            skillNames: ["Redis"],
          },
        ],
      },
    });

    // 2. Question Generation Mock
    fakeGateway.queueResponse({
      taskMatch: "question_generation",
      data: {
        prompt: "How did you design cache eviction and memory limits on your Redis cluster?",
        expectedConcepts: ["maxmemory", "allkeys-lru", "invalidation"],
        questionType: "resume_defense",
        estimatedDurationSeconds: 300,
      },
    });

    // 3. Low-scoring interview evaluation mock 1 (ratio 0.40)
    fakeGateway.queueResponse({
      taskMatch: "evaluate_interview_response",
      data: {
        explanation: "Vague answer omitting key eviction mechanics.",
        criteriaResults: [
          { criterionId: "technical_accuracy", score: 1.5, feedback: "Omitted maxmemory-policy." },
          { criterionId: "personal_ownership", score: 2.0, feedback: "Partial ownership." },
          { criterionId: "tradeoff_justification", score: 1.5, feedback: "No trade-offs." },
          { criterionId: "edge_case_awareness", score: 1.4, feedback: "No failure recovery." },
        ],
      },
    });

    // 4. Follow-up mock
    fakeGateway.queueResponse({
      taskMatch: "generate_follow_up",
      data: {
        followUpType: "prerequisite_simplify",
        prompt: "What is the difference between allkeys-lru and volatile-lru in Redis?",
        rationale: "Score was < 0.40 on core criterion, testing prerequisite definition.",
        expectedConcepts: ["TTL keys", "Eviction heuristic"],
      },
    });

    // @ts-expect-error test gateway injection
    resumeService.gateway = fakeGateway;
    // @ts-expect-error test gateway injection
    interviewService.gateway = fakeGateway;
    // @ts-expect-error test gateway injection
    libraryService.gateway = fakeGateway;
  });

  it("executes the full closed loop: Resume → Interview → Evidenced Gap → Library Practice → Retest", async () => {
    // -------------------------------------------------------------
    // JOURNEY 1: Resume Upload -> Claim Confirmation -> Target Role
    // -------------------------------------------------------------
    const uploadRes = await resumeService.processResume(userId, { text: candidateResume });
    expect(uploadRes.status).toBe("review_pending");
    expect(uploadRes.claimsCount).toBe(1);

    const resumeRecord = await resumeService.getResume(userId, uploadRes.resumeId);
    const claim = resumeRecord.claims[0];

    // Candidate reviews and confirms the claim
    const updatedResume = await resumeService.updateClaim(userId, uploadRes.resumeId, claim.id, {
      userConfirmed: true,
    });
    expect(updatedResume.status).toBe("confirmed");
    expect(updatedResume.claims[0].userConfirmed).toBe(true);

    // -------------------------------------------------------------
    // JOURNEY 2: Question Generation -> Answer -> Evaluation -> Follow-up
    // -------------------------------------------------------------
    const session = await interviewService.createSession(userId, {
      sessionType: "defense",
      targetRole: "Senior Backend Engineer",
      claims: [
        {
          claimText: claim.claimText,
          topicSlug: "redis-caching",
          topicName: "Redis Caching",
        },
      ],
    });

    expect(session.questions.length).toBe(1);
    const question = session.questions[0];
    expect(question.topicId).toBe("redis-caching");
    expect(question.claimTextSnapshot).toBe(claim.claimText);

    // Candidate answers question with weak response
    const { response, evaluation } = await interviewService.submitResponse(
      userId,
      session.id,
      question.id,
      "We just used standard Redis without configuring eviction policies."
    );

    expect(evaluation.status).toBe("completed");
    expect(evaluation.ratio!).toBeLessThan(0.60); // Low score

    // Follow-up generated
    const followUp = await interviewService.triggerFollowUp(userId, session.id, response.id);
    expect(followUp).not.toBeNull();
    expect(followUp?.followUpType).toBe("prerequisite_simplify");

    // Second weak evaluation on same topic to trigger Gap Rule v1 (requires 2 consecutive low scores)
    await evidenceService.appendEvidence({
      userId,
      topicId: "redis-caching",
      sourceType: "interview_criterion",
      sourceId: "eval_2_weak",
      criterionId: "c_tradeoff",
      ratio: 0.45,
      comparabilityKey: question.comparabilityKey,
      observedAt: new Date(),
    });

    // Small tick to ensure activity attempt is strictly after gap opened
    await new Promise((resolve) => setTimeout(resolve, 15));

    // -------------------------------------------------------------
    // JOURNEY 3: Evidenced Gap -> Handoff DTO -> Resource Matching -> Activity Attempt
    // -------------------------------------------------------------
    const userEvidence = await evidenceService.getAllUserEvidence(userId);
    const gaps = computeGaps(userEvidence);
    expect(gaps.length).toBe(1);
    const gap = gaps[0];
    expect(gap.topicId).toBe("redis-caching");

    // Handoff carries IDs only (Invariant I-11)
    const handoff = createHandoffDto(gap);
    expect((handoff as any).answer).toBeUndefined();

    // Match learning resources for gap
    const libraryResources = (await libraryService.getResources()).resources;
    const matched = matchResourcesForGap(gap, libraryResources);
    expect(matched.length).toBeGreaterThan(0);
    expect(matched[0].slug).toBe("redis-caching-patterns");

    // Candidate practices activity in library studio
    const activity = matched[0].activities[0];
    const attempt = await libraryService.submitAttempt(userId, activity.id, {
      selectedOptions: {
        q1: "opt_a", // allkeys-lru (correct)
        q2: "opt_2b", // invalidation (correct)
      },
    });

    expect(attempt.status).toBe("passed");
    expect(attempt.ratio).toBe(1.0);

    // -------------------------------------------------------------
    // JOURNEY 4: Retest Eligibility -> Retest Selection -> Before/After
    // -------------------------------------------------------------
    const evidenceAfterActivity = await evidenceService.getAllUserEvidence(userId);
    const updatedGaps = computeGaps(evidenceAfterActivity);
    expect(updatedGaps[0].retestEligible).toBe(true); // Retest now unlocked!

    const beforeAfter = computeBeforeAfter("redis-caching", evidenceAfterActivity);
    expect(beforeAfter.comparable).toBe(true);
    expect(beforeAfter.before.length).toBeGreaterThanOrEqual(1);
    expect(beforeAfter.after.length).toBeGreaterThanOrEqual(1);

    // -------------------------------------------------------------
    // JOURNEY 5: Next-Best-Action Guidance Citing Real Records
    // -------------------------------------------------------------
    const nba = computeNextBestAction({
      hasResume: true,
      unreviewedClaimsCount: 0,
      confirmedClaimsCount: 1,
      openGaps: updatedGaps,
    });

    expect(nba.actionType).toBe("retest_topic");
    expect(nba.because).toContain("passed a practice activity for 'redis-caching'");
  });
});
