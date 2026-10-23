import { z } from "zod";

// --- Skill Drills Schemas ---
export const QuestionTypeSchema = z.enum(["mcq", "output", "debug", "approach"]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuestionDifficultySchema = z.enum(["basic", "medium", "hard"]);
export type QuestionDifficulty = z.infer<typeof QuestionDifficultySchema>;

export const ConfidenceLevelSchema = z.enum(["guessing", "unsure", "certain"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const DrillOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  codeSnippet: z.string().optional(),
});
export type DrillOption = z.infer<typeof DrillOptionSchema>;

export const DrillQuestionSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  type: QuestionTypeSchema,
  difficulty: QuestionDifficultySchema,
  stem: z.string(),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().default("typescript").optional(),
  options: z.array(DrillOptionSchema).min(2).max(4),
  correctOptionId: z.string(),
  explanation: z.object({
    why: z.string(),
    distractors: z.record(z.string()), // { "opt_a": "Why A is wrong", ... }
    takeaway: z.string(),
  }),
  xpAward: z.number().int().default(15),
});
export type DrillQuestion = z.infer<typeof DrillQuestionSchema>;

export const DrillSessionConfigSchema = z.object({
  selectedSkills: z.array(z.string()).min(1),
  difficulty: z.enum(["basic", "medium", "hard", "mixed"]).default("mixed"),
  count: z.number().int().min(1).max(20).default(10),
});
export type DrillSessionConfig = z.infer<typeof DrillSessionConfigSchema>;
