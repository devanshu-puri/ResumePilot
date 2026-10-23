import { z } from "zod";
import { LlmGateway } from "@/shared/llm/gateway";
import { EvaluationResult } from "./evaluation-service";
import { AppError } from "@/shared/errors/app-error";

export const FollowUpOutputSchema = z.object({
  followUpType: z.enum([
    "probe_unclear",
    "justify_decision",
    "edge_case",
    "complexity",
    "trade_off",
    "prerequisite_simplify",
  ]),
  prompt: z.string().min(10),
  rationale: z.string().min(10),
  expectedConcepts: z.array(z.string()).default([]),
});

export interface GeneratedFollowUp {
  id: string;
  parentQuestionId: string;
  triggeringResponseId: string;
  followUpType: "probe_unclear" | "justify_decision" | "edge_case" | "complexity" | "trade_off" | "prerequisite_simplify";
  prompt: string;
  rationale: string;
  expectedConcepts: string[];
}

export const FOLLOW_UP_SYSTEM_PROMPT = `
You are an expert technical interviewer following up on a candidate's answer.
Your follow-up question must directly build on the candidate's specific response and evaluation feedback.

RULES:
1. If the candidate scored poorly (< 0.4 ratio) on foundational technical accuracy, choose "prerequisite_simplify" to test their underlying basics.
2. If the candidate scored well, probe with "edge_case", "trade_off", or "complexity".
3. Provide a clear rationale explaining why this specific follow-up was triggered.
4. Output valid JSON.
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

  const completion = await gateway.complete({
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
    schema: FollowUpOutputSchema,
  });

  if (!completion.ok) {
    throw AppError.llmUnavailable(`Failed to generate follow-up: ${completion.reason}`);
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
