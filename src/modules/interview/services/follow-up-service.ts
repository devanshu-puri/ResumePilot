import { z } from "zod";
import { LlmGateway } from "@/shared/llm/gateway";
import { EvaluationResult } from "./evaluation-service";
import { AppError } from "@/shared/errors/app-error";

const VALID_FOLLOW_UP_TYPES = [
  "probe_unclear",
  "justify_decision",
  "edge_case",
  "complexity",
  "trade_off",
  "prerequisite_simplify",
] as const;

export type FollowUpType = (typeof VALID_FOLLOW_UP_TYPES)[number];

export const FollowUpOutputSchema = z.preprocess(
  (val: any) => {
    if (typeof val === "object" && val !== null) {
      let fType = String(val.followUpType || val.type || "probe_unclear")
        .toLowerCase()
        .replace(/[\s-]/g, "_");
      if (fType === "tradeoff") fType = "trade_off";
      if (!VALID_FOLLOW_UP_TYPES.includes(fType as FollowUpType)) {
        fType = "probe_unclear";
      }
      return {
        ...val,
        followUpType: fType,
        prompt: String(val.prompt ?? val.question ?? val.questionText ?? ""),
        rationale: String(
          val.rationale ?? val.reason ?? val.explanation ?? "Deep-dive inquiry into candidate response."
        ),
        expectedConcepts: Array.isArray(val.expectedConcepts) ? val.expectedConcepts : [],
      };
    }
    return val;
  },
  z.object({
    followUpType: z.enum(VALID_FOLLOW_UP_TYPES).default("probe_unclear"),
    prompt: z.string().min(10),
    rationale: z.string().min(5),
    expectedConcepts: z.array(z.string()).default([]),
  })
);

export type FollowUpOutput = z.output<typeof FollowUpOutputSchema>;

export interface GeneratedFollowUp {
  id: string;
  parentQuestionId: string;
  triggeringResponseId: string;
  followUpType: FollowUpType;
  prompt: string;
  rationale: string;
  expectedConcepts: string[];
}

export const FOLLOW_UP_SYSTEM_PROMPT = `
You are an expert technical interviewer following up on a candidate's answer.
Your follow-up question must directly build on the candidate's specific response and evaluation feedback.

JSON format to return:
{
  "followUpType": "trade_off|edge_case|complexity|probe_unclear|justify_decision|prerequisite_simplify",
  "prompt": "Follow-up question prompt",
  "rationale": "Reason for asking this follow-up based on their answer",
  "expectedConcepts": ["concept 1", "concept 2"]
}

RULES:
1. If the candidate scored poorly (< 0.4 ratio) on foundational technical accuracy, choose "prerequisite_simplify" to test their underlying basics.
2. If the candidate scored well, probe with "edge_case", "trade_off", or "complexity".
3. Provide a clear rationale explaining why this specific follow-up was triggered.
4. Output valid JSON matching the schema above.
`.trim();

/**
 * Generates follow-up question linked to triggering response (INT-T9).
 */
export async function generateFollowUp(
  params: {
    parentQuestionId: string;
    parentQuestionPrompt: string;
    triggeringResponseId: string;
    candidateResponse: string;
    evaluation: EvaluationResult;
    existingFollowUpsCount?: number;
  },
  gateway: LlmGateway
): Promise<GeneratedFollowUp | null> {
  // Max 2 follow-ups per parent question
  if ((params.existingFollowUpsCount ?? 0) >= 2) {
    return null;
  }

  // Follow-ups only generated after a completed evaluation
  if (params.evaluation.status !== "completed") {
    return null;
  }

  const isLowScore = (params.evaluation.ratio ?? 1) < 0.4;
  const suggestedType = isLowScore ? "prerequisite_simplify" : "trade_off";

  const completion = await gateway.complete<FollowUpOutput>({
    task: "generate_follow_up",
    systemPrompt: FOLLOW_UP_SYSTEM_PROMPT,
    input: {
      parentQuestion: params.parentQuestionPrompt,
      candidateResponse: params.candidateResponse,
      evaluationRatio: params.evaluation.ratio,
      suggestedType,
      criteriaResults: params.evaluation.criteriaResults.map((c) => ({
        name: c.criterionName,
        score: c.score,
        feedback: c.feedback,
      })),
    },
    schema: FollowUpOutputSchema as z.ZodType<FollowUpOutput>,
  });

  if (!completion.ok) {
    const lowestCrit = params.evaluation.criteriaResults.reduce(
      (min, c) => ((c.score ?? 4) < (min.score ?? 4) ? c : min),
      params.evaluation.criteriaResults[0]
    );
    return {
      id: `fu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      parentQuestionId: params.parentQuestionId,
      triggeringResponseId: params.triggeringResponseId,
      followUpType: isLowScore ? "prerequisite_simplify" : "trade_off",
      prompt: lowestCrit?.feedback
        ? `Regarding ${lowestCrit.criterionName}: ${lowestCrit.feedback} How would you specifically address this trade-off or challenge in your architecture?`
        : `Could you elaborate further on the architectural trade-offs, scaling limits, and edge cases you considered?`,
      rationale: `Adaptive follow-up targeting ${lowestCrit?.criterionName || "architectural depth"}.`,
      expectedConcepts: ["Trade-offs", "Edge cases"],
    };
  }

  const data = completion.data;

  return {
    id: `fu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    parentQuestionId: params.parentQuestionId,
    triggeringResponseId: params.triggeringResponseId,
    followUpType: data.followUpType,
    prompt: data.prompt,
    rationale: data.rationale,
    expectedConcepts: data.expectedConcepts ?? [],
  };
}
