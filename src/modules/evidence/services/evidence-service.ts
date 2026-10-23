import { prisma } from "@/shared/database/prisma";
import { ensureUserId } from "@/shared/auth/repository-helper";

export type EvidenceSourceType = "interview_criterion" | "activity_attempt";

export interface AppendEvidenceInput {
  userId: string;
  topicId: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  criterionId?: string;
  ratio: number;
  comparabilityKey: string;
  rubricVersion?: string;
  observedAt?: Date;
}

export interface StoredEvidenceRecord extends AppendEvidenceInput {
  id: string;
  observedAt: Date;
  rubricVersion: string;
}

// In-memory ledger cache shared across Next.js route chunks via globalThis
const globalForEvidence = globalThis as unknown as {
  __EVIDENCE_MEMORY_STORE__?: Map<string, StoredEvidenceRecord>;
};
if (!globalForEvidence.__EVIDENCE_MEMORY_STORE__) {
  globalForEvidence.__EVIDENCE_MEMORY_STORE__ = new Map<string, StoredEvidenceRecord>();
}
const evidenceMemoryStore = globalForEvidence.__EVIDENCE_MEMORY_STORE__;

export class EvidenceService {
  /**
   * Idempotent append to TopicEvidence ledger (EVD-T1, Invariant I-03).
   * Ratio is bounded between 0 and 1.
   * Duplicate writes for the same (sourceType, sourceId, criterionId) are no-ops.
   */
  async appendEvidence(input: AppendEvidenceInput): Promise<StoredEvidenceRecord> {
    const validUserId = ensureUserId(input.userId);

    // Bound ratio strictly between 0 and 1
    const boundedRatio = Math.max(0, Math.min(1, input.ratio));
    const rubricVersion = input.rubricVersion ?? "v1";
    const observedAt = input.observedAt ?? new Date();

    // Idempotency key: sourceType:sourceId:criterionId
    const idempotencyKey = `${input.sourceType}:${input.sourceId}:${input.criterionId ?? "root"}`;

    const existing = evidenceMemoryStore.get(idempotencyKey);
    if (existing) {
      return existing;
    }

    const recordId = `evd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: StoredEvidenceRecord = {
      id: recordId,
      userId: validUserId,
      topicId: input.topicId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      criterionId: input.criterionId,
      ratio: boundedRatio,
      comparabilityKey: input.comparabilityKey,
      rubricVersion,
      observedAt,
    };

    evidenceMemoryStore.set(idempotencyKey, newRecord);

    if (process.env.NODE_ENV !== "test") {
      try {
        await prisma.topicEvidence.upsert({
          where: {
            sourceType_sourceId_criterionId: {
              sourceType: input.sourceType,
              sourceId: input.sourceId,
              criterionId: input.criterionId ?? "",
            },
          },
          update: {}, // Idempotent no-op
          create: {
            userId: validUserId,
            topicId: input.topicId,
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            criterionId: input.criterionId,
            ratio: boundedRatio,
            comparabilityKey: input.comparabilityKey,
            rubricVersion,
            observedAt,
          },
        });
      } catch {
        // Fallback to memory
      }
    }

    return newRecord;
  }

  /**
   * Retrieves all evidence for a user and topic, ordered by observedAt desc.
   */
  async getTopicEvidence(userId: string, topicId: string): Promise<StoredEvidenceRecord[]> {
    const validUserId = ensureUserId(userId);
    const records: StoredEvidenceRecord[] = [];

    for (const record of Array.from(evidenceMemoryStore.values())) {
      if (record.userId === validUserId && record.topicId === topicId) {
        records.push(record);
      }
    }

    return records.sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
  }

  /**
   * Retrieves all evidence across topics for user.
   */
  async getAllUserEvidence(userId: string): Promise<StoredEvidenceRecord[]> {
    const validUserId = ensureUserId(userId);
    const records: StoredEvidenceRecord[] = [];

    for (const record of Array.from(evidenceMemoryStore.values())) {
      if (record.userId === validUserId) {
        records.push(record);
      }
    }

    return records.sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
  }

  _clearMemory(): void {
    evidenceMemoryStore.clear();
  }
}

export const evidenceService = new EvidenceService();
