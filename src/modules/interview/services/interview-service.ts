import { LlmGateway, getLlmGateway } from "@/shared/llm";
import { PreparedQuestion, generateQuestion } from "./question-generator";
import { evaluateResponse, EvaluationResult } from "./evaluation-service";
import { generateFollowUp, GeneratedFollowUp } from "./follow-up-service";
import { transitionSession, SessionState, SessionStatus } from "../domain/session-state-machine";
import { AppError } from "@/shared/errors/app-error";
import { ensureUserId } from "@/shared/auth/repository-helper";

export interface StoredResponse {
  id: string;
  questionId: string;
  answerFormat: "text" | "code";
  responseText: string;
  submittedAt: Date;
  evaluation?: EvaluationResult;
  followUps: GeneratedFollowUp[];
}

export interface StoredSession {
  id: string;
  userId: string;
  sessionType: "defense" | "challenge" | "mock";
  status: SessionStatus;
  targetRole: string;
  currentQuestionIndex: number;
  questions: PreparedQuestion[];
  responses: StoredResponse[];
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
}

// In-memory session cache shared across Next.js route chunks via globalThis
const globalForInterview = globalThis as unknown as {
  __SESSION_MEMORY_STORE__?: Map<string, StoredSession>;
};
if (!globalForInterview.__SESSION_MEMORY_STORE__) {
  globalForInterview.__SESSION_MEMORY_STORE__ = new Map<string, StoredSession>();
}
const sessionMemoryStore = globalForInterview.__SESSION_MEMORY_STORE__;

export class InterviewService {
  constructor(private gateway: LlmGateway = getLlmGateway()) {}

  /**
   * Creates a new practice session (defense, challenge, or mock).
   */
  async createSession(
    userId: string,
    params: {
      sessionType: "defense" | "challenge" | "mock";
      targetRole: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      claims?: { claimText: string; topicSlug: string; topicName: string }[];
      topicSlugs?: string[];
    }
  ): Promise<StoredSession> {
    const validUserId = ensureUserId(userId);
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const questions: PreparedQuestion[] = [];

    // If defense session, generate questions grounded in provided claims
    if (params.sessionType === "defense" && params.claims && params.claims.length > 0) {
      const claimsToUse = params.claims.slice(0, 3);
      const generatedQuestions = await Promise.all(
        claimsToUse.map(async (claim) => {
          try {
            return await generateQuestion(
              {
                topicSlug: claim.topicSlug,
                topicName: claim.topicName,
                claimText: claim.claimText,
                targetRole: params.targetRole,
                difficulty: params.difficulty ?? "intermediate",
              },
              this.gateway
            );
          } catch (err) {
            console.warn("Failed generating question for claim, fallback used:", err);
            return {
              id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              topicId: claim.topicSlug,
              questionType: "resume_defense" as const,
              prompt: `In your resume, you stated: "${claim.claimText}". Can you walk me through your technical design choices, internal architecture, and trade-offs when implementing this?`,
              expectedConcepts: ["Internal architecture", "Technical trade-offs", "Failure handling"],
              rubricId: "resume_defense_v1",
              rubricVersion: "v1",
              comparabilityKey: `${claim.topicSlug}:resume_defense_v1:${params.difficulty ?? "intermediate"}`,
              claimTextSnapshot: claim.claimText,
              difficulty: params.difficulty ?? "intermediate",
              estimatedDurationSeconds: 300,
            };
          }
        })
      );
      questions.push(...generatedQuestions);
    } else {
      // Challenge or mock mode: generate conceptual / architectural questions
      const topics = params.topicSlugs ?? ["redis-caching", "sql-fundamentals"];
      for (const t of topics) {
        const q = await generateQuestion(
          {
            topicSlug: t,
            topicName: t.replace(/-/g, " "),
            targetRole: params.targetRole,
            difficulty: params.difficulty ?? "intermediate",
            existingQuestionsInSession: questions.map((item) => ({
              topicSlug: item.topicId,
              expectedConcepts: item.expectedConcepts,
            })),
          },
          this.gateway
        );
        questions.push(q);
      }
    }

    const session: StoredSession = {
      id: sessionId,
      userId: validUserId,
      sessionType: params.sessionType,
      status: "in_progress",
      targetRole: params.targetRole,
      currentQuestionIndex: 0,
      questions,
      responses: [],
      startedAt: new Date(),
    };

    sessionMemoryStore.set(sessionId, session);
    return session;
  }

  /**
   * Retrieves a session by ID with owner check (INT-T11).
   */
  async getSession(userId: string, sessionId: string): Promise<StoredSession> {
    const validUserId = ensureUserId(userId);
    const session = sessionMemoryStore.get(sessionId);

    if (!session || session.userId !== validUserId) {
      throw AppError.notFound("Interview session not found");
    }

    return session;
  }

  /**
   * Submits candidate response, runs evaluation, and appends evidence (INT-T6, INT-T7, INT-T8).
   */
  async submitResponse(
    userId: string,
    sessionId: string,
    questionId: string,
    responseText: string,
    answerFormat: "text" | "code" = "text"
  ): Promise<{ response: StoredResponse; evaluation: EvaluationResult }> {
    const session = await this.getSession(userId, sessionId);

    if (session.status !== "in_progress") {
      throw AppError.badRequest(`Cannot submit responses to a session in status: ${session.status}`);
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw AppError.notFound("Question not found in this session");
    }

    // INT-T6: Empty or whitespace responses cannot be submitted or persisted
    if (!responseText || responseText.trim().length === 0) {
      throw AppError.validation("Candidate response is empty. Empty responses are not persisted.");
    }

    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const evaluation = await evaluateResponse(
      question,
      {
        id: responseId,
        userId: session.userId,
        responseText: responseText.trim(),
      },
      this.gateway
    );

    const storedResponse: StoredResponse = {
      id: responseId,
      questionId,
      answerFormat,
      responseText: responseText.trim(),
      submittedAt: new Date(),
      evaluation,
      followUps: [],
    };

    session.responses.push(storedResponse);

    return { response: storedResponse, evaluation };
  }

  /**
   * Generates follow-up for a response (INT-T9).
   */
  async triggerFollowUp(
    userId: string,
    sessionId: string,
    responseId: string
  ): Promise<GeneratedFollowUp | null> {
    const session = await this.getSession(userId, sessionId);
    const response = session.responses.find((r) => r.id === responseId);

    if (!response || !response.evaluation) {
      throw AppError.notFound("Triggering response or evaluation not found");
    }

    const question = session.questions.find((q) => q.id === response.questionId);
    if (!question) throw AppError.notFound("Parent question not found");

    const followUp = await generateFollowUp(
      {
        parentQuestionId: question.id,
        parentQuestionPrompt: question.prompt,
        triggeringResponseId: response.id,
        candidateResponse: response.responseText,
        evaluation: response.evaluation,
        existingFollowUpsCount: response.followUps.length,
      },
      this.gateway
    );

    if (followUp) {
      response.followUps.push(followUp);
    }

    return followUp;
  }

  /**
   * Advances session question or updates state (INT-T4).
   */
  async updateSessionState(
    userId: string,
    sessionId: string,
    action: { type: "START" | "NEXT_QUESTION" | "PAUSE" | "RESUME" | "COMPLETE" | "ABANDON" }
  ): Promise<StoredSession> {
    const session = await this.getSession(userId, sessionId);

    const state: SessionState = {
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      startedAt: session.startedAt,
      pausedAt: session.pausedAt,
      completedAt: session.completedAt,
    };

    const nextState = transitionSession(state, action);

    session.status = nextState.status;
    session.currentQuestionIndex = nextState.currentQuestionIndex;
    session.startedAt = nextState.startedAt;
    session.pausedAt = nextState.pausedAt;
    session.completedAt = nextState.completedAt;

    return session;
  }

  _clearMemory(): void {
    sessionMemoryStore.clear();
  }
}

export const interviewService = new InterviewService();
