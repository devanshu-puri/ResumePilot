import { z } from "zod";
import { LlmGateway } from "@/shared/llm/gateway";
import { getRubricForQuestionType } from "../domain/rubrics";
import { AppError } from "@/shared/errors/app-error";

export const QuestionGenerationOutputSchema = z.object({
  prompt: z.string().min(10),
  expectedConcepts: z.array(z.string()).min(1),
  questionType: z.enum(["resume_defense", "conceptual", "code_explanation"]).default("resume_defense"),
  estimatedDurationSeconds: z.number().default(300),
});

export type GeneratedQuestionOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export interface QuestionGenerationInput {
  topicSlug: string;
  topicName: string;
  claimText?: string;
  targetRole: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  existingQuestionsInSession?: { topicSlug: string; expectedConcepts: string[] }[];
}

export interface PreparedQuestion {
  id: string;
  topicId: string;
  questionType: "resume_defense" | "conceptual" | "code_explanation";
  prompt: string;
  expectedConcepts: string[];
  rubricId: string;
  rubricVersion: string;
  comparabilityKey: string;
  claimTextSnapshot?: string;
  difficulty: string;
  estimatedDurationSeconds: number;
}

// Well-known technologies for hallucination guard
const KNOWN_TECHNOLOGIES = [
  "kubernetes", "docker", "redis", "postgresql", "mysql", "mongodb", "kafka",
  "rabbitmq", "graphql", "rest", "grpc", "aws", "gcp", "azure", "react", "vue",
  "angular", "node", "python", "golang", "rust", "c++", "java", "typescript"
];

/**
 * Post-check: rejects questions naming technologies completely outside the claim and topic (INT-T5).
 */
export function validateNoHallucinatedTech(
  prompt: string,
  allowedContext: string
): void {
  const lowerPrompt = prompt.toLowerCase();
  const lowerContext = allowedContext.toLowerCase();

  for (const tech of KNOWN_TECHNOLOGIES) {
    if (lowerPrompt.includes(tech) && !lowerContext.includes(tech)) {
      throw AppError.validation(
        `Generated question hallucinated technology '${tech}' not present in source claim or topic.`
      );
    }
  }
}

/**
 * Post-check: prevents duplicate questions within session with same topic and concept set (INT-T5).
 */
export function validateNoDuplicateQuestion(
  topicSlug: string,
  expectedConcepts: string[],
  existing: { topicSlug: string; expectedConcepts: string[] }[] = []
): void {
  const newSet = new Set(expectedConcepts.map((c) => c.toLowerCase().trim()));

  for (const prev of existing) {
    if (prev.topicSlug === topicSlug) {
      const prevSet = new Set(prev.expectedConcepts.map((c) => c.toLowerCase().trim()));
      // If concept sets match
      let allMatch = prevSet.size === newSet.size;
      if (allMatch) {
        for (const concept of Array.from(newSet)) {
          if (!prevSet.has(concept)) {
            allMatch = false;
            break;
          }
        }
      }
      if (allMatch) {
        throw AppError.validation(
          `Duplicate question detected: session already contains question for ${topicSlug} with identical concept requirements.`
        );
      }
    }
  }
}

export const QUESTION_GENERATION_PROMPT = `
You are an expert technical interviewer.
Generate an authentic, challenging interview question strictly grounded in the candidate's verified claim.
Rules:
1. Do NOT assume facts or technologies outside the provided claim text and topic.
2. The question must test deep conceptual understanding, internal architecture, and trade-offs.
3. List 2-4 specific expected concepts the candidate should address in their answer.
4. Output schema-valid JSON only.
`.trim();

/**
 * Generates an interview question using the LLM Gateway with post-generation safety checks (INT-T5).
 */
export async function generateQuestion(
  input: QuestionGenerationInput,
  gateway: LlmGateway
): Promise<PreparedQuestion> {
  const allowedContext = `${input.topicSlug} ${input.topicName} ${input.claimText ?? ""} ${input.targetRole}`;

  const completion = await gateway.complete({
    task: "question_generation",
    systemPrompt: QUESTION_GENERATION_PROMPT,
    input: {
      topic: input.topicName,
      claim: input.claimText ?? "No specific claim, conceptual inquiry.",
      targetRole: input.targetRole,
      difficulty: input.difficulty ?? "intermediate",
    },
    schema: QuestionGenerationOutputSchema,
  });

  if (!completion.ok) {
    throw AppError.llmUnavailable(`Failed to generate interview question: ${completion.reason}`);
  }

  const generated = completion.data;

  const qType = generated.questionType ?? "resume_defense";
  const expectedConcepts = generated.expectedConcepts ?? [];
  const estimatedDurationSeconds = generated.estimatedDurationSeconds ?? 300;

  // Post-check 1: Hallucinated technology
  validateNoHallucinatedTech(generated.prompt, allowedContext);

  // Post-check 2: Duplicate concept set resolution (INT-T5)
  if (input.existingQuestionsInSession) {
    const isDuplicate = input.existingQuestionsInSession.some((prev) => {
      if (prev.topicSlug !== input.topicSlug) return false;
      const prevSet = new Set(prev.expectedConcepts.map((c) => c.toLowerCase().trim()));
      return (
        expectedConcepts.every((c) => prevSet.has(c.toLowerCase().trim())) &&
        prevSet.size === expectedConcepts.length
      );
    });

    if (isDuplicate) {
      // Differentiate concepts with claim or subtopic specificity
      const differentiator = input.claimText
        ? `Implementation trade-offs: ${input.claimText.slice(0, 40)}`
        : `Failure recovery & trade-offs in ${input.topicName}`;
      expectedConcepts.push(differentiator);
    }
  }

  const rubric = getRubricForQuestionType(qType);
  const comparabilityKey = `${input.topicSlug}:${rubric.id}:${input.difficulty ?? "intermediate"}`;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    topicId: input.topicSlug,
    questionType: qType,
    prompt: generated.prompt,
    expectedConcepts,
    rubricId: rubric.id,
    rubricVersion: rubric.version,
    comparabilityKey,
    claimTextSnapshot: input.claimText,
    difficulty: input.difficulty ?? "intermediate",
    estimatedDurationSeconds,
  };
}
