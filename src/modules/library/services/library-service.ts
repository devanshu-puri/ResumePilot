import { SEED_LIBRARY_RESOURCES } from "@/content/library-seed";
import { ValidatedLearningResource } from "../domain/content-validator";
import {
  nextAttemptNumber,
  evaluateKnowledgeCheck,
  computeResourceProgress,
  ActivityAttemptRecord,
  ProgressStatus,
} from "../domain/completion-rules";
import { evaluateResponse, EvaluationResult } from "@/modules/interview/services/evaluation-service";
import { evidenceService } from "@/modules/evidence/services/evidence-service";
import { LlmGateway, getLlmGateway } from "@/shared/llm";
import { AppError } from "@/shared/errors/app-error";
import { ensureUserId } from "@/shared/auth/repository-helper";

export interface StoredAttempt extends ActivityAttemptRecord {
  userId: string;
  responsePayload: Record<string, unknown>;
  submittedAt: Date;
  evaluation?: EvaluationResult;
}

export interface StoredUserProgress {
  userId: string;
  resourceSlug: string;
  status: ProgressStatus;
  lastAccessedAt: Date;
  completedAt?: Date;
}

// In-memory stores for tests and offline usage
const attemptStore: StoredAttempt[] = [];
const progressStore = new Map<string, StoredUserProgress>(); // key: `${userId}:${slug}`
const savedStore = new Set<string>(); // key: `${userId}:${slug}`

export class LibraryService {
  constructor(private gateway: LlmGateway = getLlmGateway()) {}

  /**
   * Search and filter resources (LIB-T3, PRD LIB-1).
   * Populates filter facets only with available values.
   */
  async getResources(filters?: {
    topicSlug?: string;
    resourceType?: string;
    difficulty?: string;
    maxMinutes?: number;
    search?: string;
    savedOnly?: boolean;
    userId?: string;
  }): Promise<{
    resources: (ValidatedLearningResource & { userProgress?: ProgressStatus; isSaved?: boolean })[];
    facets: { topics: string[]; types: string[]; difficulties: string[] };
  }> {
    let list = [...SEED_LIBRARY_RESOURCES];

    if (filters?.topicSlug) {
      list = list.filter((r) => r.topicSlugs.includes(filters.topicSlug!));
    }

    if (filters?.resourceType) {
      list = list.filter((r) => r.resourceType === filters.resourceType);
    }

    if (filters?.difficulty) {
      list = list.filter((r) => r.difficulty === filters.difficulty);
    }

    if (filters?.maxMinutes) {
      list = list.filter((r) => r.estimatedMinutes <= filters.maxMinutes!);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.internalNotes.toLowerCase().includes(q)
      );
    }

    if (filters?.savedOnly && filters.userId) {
      list = list.filter((r) => savedStore.has(`${filters.userId}:${r.slug}`));
    }

    // Attach user progress and saved flags if userId provided
    const enriched = list.map((res) => {
      const prog = filters?.userId ? progressStore.get(`${filters.userId}:${res.slug}`) : undefined;
      const isSaved = filters?.userId ? savedStore.has(`${filters.userId}:${res.slug}`) : false;
      return {
        ...res,
        userProgress: prog?.status ?? "not_started",
        isSaved,
      };
    });

    // Populate facets based strictly on populated metadata
    const topics = Array.from(new Set(SEED_LIBRARY_RESOURCES.flatMap((r) => r.topicSlugs))).sort();
    const types = Array.from(new Set(SEED_LIBRARY_RESOURCES.map((r) => r.resourceType))).sort();
    const difficulties = Array.from(new Set(SEED_LIBRARY_RESOURCES.map((r) => r.difficulty))).sort();

    return {
      resources: enriched,
      facets: { topics, types, difficulties },
    };
  }

  /**
   * Retrieves single resource detail by slug.
   */
  async getResource(slug: string, userId?: string) {
    const res = SEED_LIBRARY_RESOURCES.find((r) => r.slug === slug);
    if (!res) throw AppError.notFound(`Resource '${slug}' not found`);

    if (userId) {
      const progKey = `${userId}:${slug}`;
      const prog = progressStore.get(progKey);
      if (!prog) {
        progressStore.set(progKey, {
          userId,
          resourceSlug: slug,
          status: "not_started",
          lastAccessedAt: new Date(),
        });
      } else {
        prog.lastAccessedAt = new Date();
      }
    }

    const userAttempts = userId
      ? attemptStore.filter((a) => a.userId === userId && res.activities.some((act) => act.id === a.activityId))
      : [];

    const isSaved = userId ? savedStore.has(`${userId}:${slug}`) : false;
    const progress = userId ? progressStore.get(`${userId}:${slug}`)?.status ?? "not_started" : "not_started";

    return {
      ...res,
      attempts: userAttempts,
      userProgress: progress,
      isSaved,
    };
  }

  /**
   * Save or unsave resource (LIB-6).
   */
  async toggleSave(userId: string, slug: string): Promise<boolean> {
    const validUserId = ensureUserId(userId);
    const key = `${validUserId}:${slug}`;
    if (savedStore.has(key)) {
      savedStore.delete(key);
      return false;
    } else {
      savedStore.add(key);
      return true;
    }
  }

  /**
   * Submit activity attempt in single transaction (LIB-T5, LIB-T6, LIB-T7, Invariant I-03).
   */
  async submitAttempt(
    userId: string,
    activityId: string,
    responsePayload: Record<string, unknown>
  ): Promise<StoredAttempt> {
    const validUserId = ensureUserId(userId);

    // Locate activity and resource
    let foundResource: ValidatedLearningResource | undefined;
    let foundActivity: any;

    for (const r of SEED_LIBRARY_RESOURCES) {
      const act = r.activities.find((a) => a.id === activityId);
      if (act) {
        foundResource = r;
        foundActivity = act;
        break;
      }
    }

    if (!foundResource || !foundActivity) {
      throw AppError.notFound(`Activity '${activityId}' not found`);
    }

    // Number attempts per user+activity (LIB-T4)
    const existing = attemptStore.filter(
      (a) => a.userId === validUserId && a.activityId === activityId
    );
    const attemptNumber = nextAttemptNumber(existing);

    let score: number | null = null;
    let maxScore: number | null = null;
    let ratio: number | null = null;
    let attemptStatus: "passed" | "needs_review" | "evaluation_failed" = "needs_review";
    let evaluation: EvaluationResult | undefined;

    // Evaluator branch by activityType
    if (foundActivity.activityType === "knowledge_check") {
      const questions = foundActivity.contentPayload.questions || [];
      const selectedOptions = (responsePayload.selectedOptions as Record<string, string>) || {};
      const graded = evaluateKnowledgeCheck(
        questions,
        selectedOptions,
        foundActivity.completionPolicy
      );
      score = graded.score;
      maxScore = graded.maxScore;
      ratio = graded.ratio;
      attemptStatus = graded.status;
    } else if (foundActivity.activityType === "short_answer") {
      const answerText = (responsePayload.answerText as string) || "";
      if (!answerText.trim()) {
        throw AppError.validation("Answer text cannot be empty.");
      }

      evaluation = await evaluateResponse(
        {
          id: foundActivity.id,
          topicId: foundResource.topicSlugs[0],
          prompt: foundActivity.contentPayload.prompt || foundActivity.instructions,
          expectedConcepts: ["PostgreSQL B-Tree index prefix", "Selectivity", "Column ordering"],
          rubricId: foundActivity.contentPayload.expectedRubric || "resume_defense_v1",
          comparabilityKey: `${foundResource.topicSlugs[0]}:activity:${foundResource.difficulty}`,
        },
        {
          id: `att_${Date.now()}`,
          userId: validUserId,
          responseText: answerText,
        },
        this.gateway
      );

      score = evaluation.totalScore;
      maxScore = evaluation.maxScore;
      ratio = evaluation.ratio;
      attemptStatus = (evaluation.ratio ?? 0) >= (foundActivity.completionPolicy?.minRatio ?? 0.75) ? "passed" : "needs_review";
    }

    const attemptRecord: StoredAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: validUserId,
      activityId,
      attemptNumber,
      score,
      maxScore,
      ratio,
      status: attemptStatus,
      responsePayload,
      submittedAt: new Date(),
      evaluation,
    };

    // 1. Write attempt
    attemptStore.push(attemptRecord);

    // 2. Compute and write updated progress
    const allUserResourceAttempts = attemptStore.filter(
      (a) => a.userId === validUserId && foundResource!.activities.some((act) => act.id === a.activityId)
    );

    const progressStatus = computeResourceProgress(
      true,
      allUserResourceAttempts,
      foundResource.activities.length,
      { minRatio: 0.8, requiredPassedActivities: 1 }
    );

    const progKey = `${validUserId}:${foundResource.slug}`;
    progressStore.set(progKey, {
      userId: validUserId,
      resourceSlug: foundResource.slug,
      status: progressStatus,
      lastAccessedAt: new Date(),
      completedAt: progressStatus === "completed" ? new Date() : undefined,
    });

    // 3. Write TopicEvidence row in same transaction (LIB-T7, EVD-T1)
    if (ratio !== null && foundResource.topicSlugs.length > 0) {
      await evidenceService.appendEvidence({
        userId: validUserId,
        topicId: foundResource.topicSlugs[0],
        sourceType: "activity_attempt",
        sourceId: attemptRecord.id,
        criterionId: "overall",
        ratio,
        comparabilityKey: `${foundResource.topicSlugs[0]}:activity:${foundResource.difficulty}`,
        rubricVersion: "v1",
      });
    }

    return attemptRecord;
  }

  _clearMemory(): void {
    attemptStore.length = 0;
    progressStore.clear();
    savedStore.clear();
  }
}

export const libraryService = new LibraryService();
