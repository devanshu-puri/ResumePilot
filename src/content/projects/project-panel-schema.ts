import { z } from "zod";
import { QuestionDifficultySchema } from "../drills/drill-schema";

export const ProjectQuestionCategorySchema = z.enum([
  "Architecture & System Design",
  "Scale & Performance",
  "Failure Modes & Edge Cases",
  "Trade-offs & Alternatives",
  "Data Modeling & Storage",
  "Concurrency & Race Conditions",
]);
export type ProjectQuestionCategory = z.infer<typeof ProjectQuestionCategorySchema>;

export const ParsedProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
  summary: z.string(),
  techStack: z.array(z.string()),
  metrics: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
});
export type ParsedProject = z.infer<typeof ParsedProjectSchema>;

export const ProjectQuestionStatusSchema = z.enum(["unreviewed", "got_it", "need_review"]);
export type ProjectQuestionStatus = z.infer<typeof ProjectQuestionStatusSchema>;

export const ProjectQuestionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  category: ProjectQuestionCategorySchema,
  difficulty: QuestionDifficultySchema,
  question: z.string(),
  modelAnswer: z.string(), // STAR format: Situation, Task, Action, Result
  keyPoints: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  followUps: z.array(z.string()),
  status: ProjectQuestionStatusSchema.default("unreviewed"),
});
export type ProjectQuestion = z.infer<typeof ProjectQuestionSchema>;
