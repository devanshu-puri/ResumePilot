import { z } from "zod";
import { LlmGateway } from "@/shared/llm/gateway";
import { getRubricForQuestionType } from "../domain/rubrics";
import { AppError } from "@/shared/errors/app-error";

export const QuestionGenerationOutputSchema = z.preprocess(
  (val: any) => {
    if (typeof val === "object" && val !== null) {
      const prompt = val.prompt ?? val.question ?? val.questionText ?? val.text ?? "";
      const expectedConcepts =
        val.expectedConcepts ?? val.concepts ?? val.keyConcepts ?? val.criteria ?? [];
      const questionType = val.questionType ?? "resume_defense";
      const estimatedDurationSeconds = val.estimatedDurationSeconds ?? 300;
      return {
        ...val,
        prompt: String(prompt),
        expectedConcepts: Array.isArray(expectedConcepts)
          ? expectedConcepts.map(String)
          : [String(expectedConcepts)],
        questionType,
        estimatedDurationSeconds: Number(estimatedDurationSeconds) || 300,
      };
    }
    return val;
  },
  z.object({
    prompt: z.string().min(10),
    expectedConcepts: z.array(z.string()).min(1),
    questionType: z.enum(["resume_defense", "conceptual", "code_explanation"]).default("resume_defense"),
    estimatedDurationSeconds: z.number().default(300),
  })
);

export type GeneratedQuestionOutput = z.output<typeof QuestionGenerationOutputSchema>;

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

const TECH_SYNONYMS: Record<string, string[]> = {
  supabase: ["postgresql", "postgres", "sql", "database", "auth", "rest", "graphql"],
  postgres: ["postgresql", "sql", "supabase", "database", "relational"],
  postgresql: ["postgres", "sql", "supabase", "database", "relational"],
  mysql: ["sql", "database", "relational"],
  mongodb: ["nosql", "database", "document"],
  vercel: ["next", "react", "node", "serverless", "deployment", "rest", "frontend"],
  v0: ["vercel", "react", "frontend", "ui", "tailwind"],
  next: ["react", "node", "javascript", "typescript", "vercel", "frontend"],
  react: ["javascript", "typescript", "html", "css", "web", "frontend"],
  pandas: ["python", "dataframe", "numpy", "data"],
  matplotlib: ["python", "visualization", "plotting", "data"],
  grok: ["ai", "llm", "api", "rest", "python", "model", "token", "prompt"],
  c: ["c++", "memory", "pointers", "dsa", "algorithms"],
  "c++": ["c", "memory", "pointers", "dsa", "algorithms", "stl"],
  python: ["pandas", "matplotlib", "numpy", "backend", "scripting"],
};

/**
 * Post-check: rejects questions naming technologies completely outside the claim and topic (INT-T5).
 */
export function validateNoHallucinatedTech(
  prompt: string,
  allowedContext: string
): void {
  let lowerContext = allowedContext.toLowerCase();

  // Expand allowed context with known ecosystem relationships (e.g. Supabase -> PostgreSQL)
  for (const [key, synonyms] of Object.entries(TECH_SYNONYMS)) {
    if (lowerContext.includes(key)) {
      lowerContext += " " + synonyms.join(" ");
    }
  }

  for (const tech of KNOWN_TECHNOLOGIES) {
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(prompt) && !lowerContext.includes(tech.toLowerCase())) {
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

JSON format to return:
{
  "prompt": "Your detailed technical question here",
  "expectedConcepts": ["concept 1", "concept 2", "concept 3"],
  "questionType": "resume_defense",
  "estimatedDurationSeconds": 300
}

Rules:
1. Do NOT assume facts or technologies outside the provided claim text and topic.
2. The question must test deep conceptual understanding, internal architecture, and trade-offs.
3. List 2-4 specific expected concepts the candidate should address in their answer.
4. Output valid JSON matching the schema above.
`.trim();

/**
 * Generates an interview question using the LLM Gateway with post-generation safety checks (INT-T5).
 */
export async function generateQuestion(
  input: QuestionGenerationInput,
  gateway: LlmGateway
): Promise<PreparedQuestion> {
  const allowedContext = `${input.topicSlug} ${input.topicName} ${input.claimText ?? ""} ${input.targetRole}`;

  const completion = await gateway.complete<GeneratedQuestionOutput>({
    task: "question_generation",
    systemPrompt: QUESTION_GENERATION_PROMPT,
    input: {
      topic: input.topicName,
      claim: input.claimText ?? "No specific claim, conceptual inquiry.",
      targetRole: input.targetRole,
      difficulty: input.difficulty ?? "intermediate",
    },
    schema: QuestionGenerationOutputSchema as z.ZodType<GeneratedQuestionOutput>,
  });

  if (!completion.ok) {
    throw AppError.llmUnavailable(`Failed to generate interview question: ${completion.reason}`);
  }

  const generated = completion.data;

  const qType = generated.questionType ?? "resume_defense";
  const expectedConcepts = generated.expectedConcepts ?? [];
  const estimatedDurationSeconds = generated.estimatedDurationSeconds ?? 300;

  // Post-check 1: Hallucinated technology
  try {
    validateNoHallucinatedTech(generated.prompt, allowedContext);
  } catch (err) {
    console.warn("Hallucination check warning, repairing question:", (err as Error).message);
    // If it threw, attempt repair with strict instruction
    const repair = await gateway.complete<GeneratedQuestionOutput>({
      task: "question_generation_repair",
      systemPrompt: `${QUESTION_GENERATION_PROMPT}\n\nSTRICT CONSTRAINT: Do NOT name any outside technologies or frameworks. Base the question directly on: "${input.claimText || input.topicName}".`,
      input: {
        topic: input.topicName,
        claim: input.claimText ?? "No specific claim, conceptual inquiry.",
        targetRole: input.targetRole,
        difficulty: input.difficulty ?? "intermediate",
      },
      schema: QuestionGenerationOutputSchema as z.ZodType<GeneratedQuestionOutput>,
    });

    if (repair.ok && repair.data?.prompt) {
      generated.prompt = repair.data.prompt;
      if (repair.data.expectedConcepts) {
        generated.expectedConcepts = repair.data.expectedConcepts;
      }
    } else {
      // Graceful fallback to authentic question grounded in the claim
      generated.prompt = input.claimText
        ? `In your project, you stated: "${input.claimText}". Can you walk me through your technical design choices, internal architecture, and trade-offs when implementing this?`
        : `Can you explain the internal mechanics, architecture, and common trade-offs when working with ${input.topicName}?`;
    }
  }

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
