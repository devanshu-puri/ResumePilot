import { LlmGateway, LlmCompletionRequest, LlmCompletionResult } from "./gateway";
import { logger } from "@/shared/logging/logger";

export interface ProgrammedResponse<T = unknown> {
  taskMatch?: string | RegExp;
  data?: T;
  rawJson?: string;
  failReason?: string;
  retryable?: boolean;
  delayMs?: number;
}

/**
 * Fake implementation of LlmGateway for tests, CI, and reproducible evals (FND-T7).
 */
export class FakeLlmGateway implements LlmGateway {
  private programmedResponses: ProgrammedResponse[] = [];
  public callCount = 0;
  public lastRequest?: LlmCompletionRequest;

  /**
   * Program a mock response for a task.
   */
  queueResponse<T>(res: ProgrammedResponse<T>): this {
    this.programmedResponses.push(res);
    return this;
  }

  clearQueue(): void {
    this.programmedResponses = [];
    this.callCount = 0;
    this.lastRequest = undefined;
  }

  async complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>> {
    this.callCount++;
    this.lastRequest = req;

    const startTime = Date.now();

    // Check if there is a matching programmed response
    const idx = this.programmedResponses.findIndex((p) => {
      if (!p.taskMatch) return true;
      if (typeof p.taskMatch === "string") return req.task === p.taskMatch;
      return p.taskMatch.test(req.task);
    });

    const mock = idx !== -1 ? this.programmedResponses.splice(idx, 1)[0] : undefined;

    if (mock?.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, mock.delayMs));
    }

    const latencyMs = Date.now() - startTime;

    if (mock?.failReason) {
      logger.warn("FakeLlmGateway simulated failure", {
        taskId: req.task,
        latencyMs,
      });
      return {
        ok: false,
        reason: mock.failReason,
        retryable: mock.retryable ?? true,
        latencyMs,
      };
    }

    let payload: unknown = mock?.data;

    if (mock?.rawJson) {
      try {
        payload = JSON.parse(mock.rawJson);
      } catch {
        return {
          ok: false,
          reason: "Malformed JSON in mock output",
          retryable: true,
          latencyMs,
        };
      }
    }

    // If schema provided, validate against it
    if (req.schema && payload !== undefined) {
      const validation = req.schema.safeParse(payload);
      if (!validation.success) {
        return {
          ok: false,
          reason: `Schema validation failed: ${validation.error.message}`,
          retryable: true,
          latencyMs,
        };
      }
      payload = validation.data;
    }

    logger.info("FakeLlmGateway completed task", {
      taskId: req.task,
      latencyMs,
    });

    return {
      ok: true,
      data: (payload ?? {}) as T,
      latencyMs,
      usage: {
        promptTokens: 120,
        completionTokens: 80,
      },
    };
  }
}
