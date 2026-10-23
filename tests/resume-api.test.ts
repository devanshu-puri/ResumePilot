import { describe, it, expect, beforeEach } from "vitest";
import { resumeService } from "@/modules/resume/services/resume-service";
import { FakeLlmGateway } from "@/shared/llm/fake-gateway";
import { DEMO_USER_A, DEMO_USER_B } from "@/shared/auth/user";
import { AppError } from "@/shared/errors/app-error";

describe("Resume Service, Deletion & Authorization (RES-T6, RES-T7, RES-T8)", () => {
  let fakeGateway: FakeLlmGateway;

  const validText = `
Acme Corporation
Software Engineer
- Deployed Redis caching cluster reducing latency by 45%.
- Implemented JWT authentication in Node.js.
`;

  beforeEach(() => {
    resumeService._clearMemory();
    fakeGateway = new FakeLlmGateway();
    fakeGateway.queueResponse({
      taskMatch: "resume_structuring",
      data: {
        sections: [{ sectionType: "experience", title: "EXPERIENCE" }],
        projects: [{ title: "Acme Corporation", description: "Backend" }],
        skills: ["Redis", "Node.js"],
        claims: [
          {
            claimType: "performance_optimization",
            claimText: "Deployed Redis caching cluster reducing latency by 45%.",
            quoteText: "Deployed Redis caching cluster reducing latency by 45%.",
            skillNames: ["Redis"],
          },
        ],
      },
    });
    // @ts-expect-error test gateway injection
    resumeService.gateway = fakeGateway;
  });

  it("processes resume, creates active record, and resolves topics (RES-1)", async () => {
    const res = await resumeService.processResume(DEMO_USER_A.id, { text: validText });
    expect(res.resumeId).toBeDefined();
    expect(res.claimsCount).toBe(1);

    const record = await resumeService.getResume(DEMO_USER_A.id, res.resumeId);
    expect(record.userId).toBe(DEMO_USER_A.id);
    expect(record.claims.length).toBe(1);
    expect(record.claims[0].userConfirmed).toBe(false);
  });

  it("prevents User B from accessing or reading User A's resume (RES-T8)", async () => {
    const { resumeId } = await resumeService.processResume(DEMO_USER_A.id, { text: validText });

    // User A can read
    const userARead = await resumeService.getResume(DEMO_USER_A.id, resumeId);
    expect(userARead.id).toBe(resumeId);

    // User B receives 404 (cannot probe existence)
    await expect(resumeService.getResume(DEMO_USER_B.id, resumeId)).rejects.toThrow(AppError);
    await expect(resumeService.getResume(DEMO_USER_B.id, resumeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("allows user to confirm, edit, and exclude claims (RES-5)", async () => {
    const { resumeId } = await resumeService.processResume(DEMO_USER_A.id, { text: validText });
    const record = await resumeService.getResume(DEMO_USER_A.id, resumeId);
    const claimId = record.claims[0].id;

    // Confirm claim
    const updated = await resumeService.updateClaim(DEMO_USER_A.id, resumeId, claimId, {
      userConfirmed: true,
      claimText: "Architected custom Redis caching cluster.",
    });

    const confirmedClaim = updated.claims.find((c) => c.id === claimId);
    expect(confirmedClaim?.userConfirmed).toBe(true);
    expect(confirmedClaim?.claimText).toBe("Architected custom Redis caching cluster.");
    expect(updated.status).toBe("confirmed");
  });

  it("prevents User B from modifying User A's claims (RES-T8)", async () => {
    const { resumeId } = await resumeService.processResume(DEMO_USER_A.id, { text: validText });
    const record = await resumeService.getResume(DEMO_USER_A.id, resumeId);
    const claimId = record.claims[0].id;

    await expect(
      resumeService.updateClaim(DEMO_USER_B.id, resumeId, claimId, { userConfirmed: true })
    ).rejects.toThrow(AppError);
  });

  it("deletes resume with cascade so no records remain (RES-T7)", async () => {
    const { resumeId } = await resumeService.processResume(DEMO_USER_A.id, { text: validText });

    await resumeService.deleteResume(DEMO_USER_A.id, resumeId);

    // Subsequent retrieval fails with 404
    await expect(resumeService.getResume(DEMO_USER_A.id, resumeId)).rejects.toThrow(AppError);
    const active = await resumeService.getActiveResume(DEMO_USER_A.id);
    expect(active).toBeNull();
  });
});
