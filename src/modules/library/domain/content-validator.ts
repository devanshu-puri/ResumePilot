import { z } from "zod";

export const KnowledgeCheckQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(5),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ).min(2),
});

export const PracticeActivitySchema = z.object({
  id: z.string(),
  activityType: z.enum(["knowledge_check", "short_answer"]),
  title: z.string().min(3),
  instructions: z.string().min(10),
  contentPayload: z.object({
    questions: z.array(KnowledgeCheckQuestionSchema).optional(),
    prompt: z.string().optional(),
    expectedRubric: z.string().optional(),
  }),
  completionPolicy: z.object({
    minRatio: z.number().min(0).max(1).default(0.8),
  }).default({ minRatio: 0.8 }),
  orderIndex: z.number().default(0),
});

export const LearningObjectiveSchema = z.object({
  topicSlug: z.string().min(1, "Objective must be linked to a valid canonical topic slug"),
  description: z.string().min(10),
  orderIndex: z.number().default(0),
});

export const LearningResourceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  resourceType: z.enum([
    "concept_guide",
    "architecture_pattern",
    "code_deep_dive",
    "trade_off_analysis",
  ]),
  canonicalUrl: z.string().url("Resource must carry a valid canonical URL for attribution"),
  attribution: z.string().min(3, "Attribution is mandatory for every external reference"),
  internalNotes: z.string().min(15, "Resource must include original study notes"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  estimatedMinutes: z.number().min(1).default(15),
  topicSlugs: z.array(z.string()).min(1, "Resource must be tagged with at least one topic"),
  objectives: z.array(LearningObjectiveSchema).min(1, "Resource must have at least one objective"),
  activities: z.array(PracticeActivitySchema).default([]),
});

export type ValidatedLearningResource = z.infer<typeof LearningResourceSchema>;

/**
 * Validates a list of seed resources strictly against schema (LIB-T2).
 * Fails if attribution is missing or any objective lacks a topic.
 */
export function validateLibrarySeed(resources: unknown[]): ValidatedLearningResource[] {
  return z.array(LearningResourceSchema).parse(resources);
}
