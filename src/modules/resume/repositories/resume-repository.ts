import { prisma } from "@/shared/database/prisma";
import { ensureUserId } from "@/shared/auth/repository-helper";
import { StructuringResult } from "../services/resume-structuring";
import { ClaimType } from "@prisma/client";

export class ResumeRepository {
  /**
   * Creates or replaces an active resume for a user (RES-T1, RES-T7).
   */
  async createResume(userId: string, rawText: string, structured: StructuringResult) {
    const validUserId = ensureUserId(userId);

    // Deactivate previous active resumes for this user
    await prisma.resume.updateMany({
      where: { userId: validUserId, isActive: true },
      data: { isActive: false },
    });

    // Create new resume with version increment
    const previous = await prisma.resume.findFirst({
      where: { userId: validUserId },
      orderBy: { version: "desc" },
    });
    const nextVersion = (previous?.version ?? 0) + 1;

    // Create resume and associated child records in a single transaction
    return await prisma.resume.create({
      data: {
        userId: validUserId,
        version: nextVersion,
        isActive: true,
        rawText,
        status: "review_pending",
        sections: {
          create: structured.sections.map((s, idx) => ({
            sectionType: s.sectionType,
            title: s.title,
            rawContent: "",
            startOffset: 0,
            endOffset: 0,
          })),
        },
        projects: {
          create: structured.projects.map((p) => ({
            title: p.title,
            role: p.role,
            description: p.description,
            startOffset: 0,
            endOffset: 0,
          })),
        },
        claims: {
          create: structured.claims.map((c) => ({
            claimType: c.claimType as ClaimType,
            claimText: c.claimText,
            quoteText: c.quoteText,
            sourceStartOffset: c.sourceStartOffset,
            sourceEndOffset: c.sourceEndOffset,
            userConfirmed: false,
            excluded: false,
          })),
        },
      },
      include: {
        sections: true,
        projects: true,
        claims: true,
        resumeTopics: {
          include: { topic: true },
        },
      },
    });
  }

  /**
   * Finds active resume for user (Invariant I-07).
   */
  async getActiveResume(userId: string) {
    const validUserId = ensureUserId(userId);
    return await prisma.resume.findFirst({
      where: { userId: validUserId, isActive: true },
      include: {
        sections: true,
        projects: true,
        claims: {
          orderBy: { sourceStartOffset: "asc" },
        },
        resumeTopics: {
          include: { topic: true },
        },
      },
    });
  }

  /**
   * Finds resume by ID, scoped by userId.
   */
  async getResumeById(userId: string, resumeId: string) {
    const validUserId = ensureUserId(userId);
    return await prisma.resume.findFirst({
      where: { id: resumeId, userId: validUserId },
      include: {
        sections: true,
        projects: true,
        claims: {
          orderBy: { sourceStartOffset: "asc" },
        },
        resumeTopics: {
          include: { topic: true },
        },
      },
    });
  }

  /**
   * Updates claim confirmation, exclusion, or text edits (RES-5).
   */
  async updateClaim(
    userId: string,
    resumeId: string,
    claimId: string,
    data: {
      claimText?: string;
      claimType?: ClaimType;
      userConfirmed?: boolean;
      excluded?: boolean;
    }
  ) {
    const validUserId = ensureUserId(userId);

    // Verify ownership of the resume first
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: validUserId },
      select: { id: true },
    });

    if (!resume) return null;

    return await prisma.resumeClaim.update({
      where: { id: claimId, resumeId },
      data,
    });
  }

  /**
   * Deletes a resume with cascade (RES-T7).
   */
  async deleteResume(userId: string, resumeId: string): Promise<boolean> {
    const validUserId = ensureUserId(userId);

    const count = await prisma.resume.deleteMany({
      where: { id: resumeId, userId: validUserId },
    });

    return count.count > 0;
  }
}

export const resumeRepository = new ResumeRepository();
