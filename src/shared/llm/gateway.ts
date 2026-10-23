import { z } from "zod";
import { logger } from "@/shared/logging/logger";

export interface LlmCompletionRequest<T = unknown> {
  task: string;
  systemPrompt?: string;
  input: string | Record<string, unknown>;
  schema?: z.ZodType<T>;
  maxTokens?: number;
  timeoutMs?: number;
}

export type LlmCompletionResult<T = unknown> =
  | {
      ok: true;
      data: T;
      latencyMs: number;
      usage?: { promptTokens: number; completionTokens: number };
    }
  | {
      ok: false;
      reason: string;
      retryable: boolean;
      latencyMs?: number;
    };

export interface LlmGateway {
  complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>>;
}

/**
 * Open-weight compatible LLM Gateway Adapter (R3 compliance).
 * Targets open-weight models (e.g. Google Gemma 2 / 3, Llama 3) via OpenAI-compatible endpoints
 * (such as Ollama, vLLM, or LM Studio).
 */
export class OpenWeightLlmGateway implements LlmGateway {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(
    baseUrl = process.env.OPENWEIGHT_BASE_URL || "http://localhost:11434/v1",
    apiKey = process.env.OPENWEIGHT_API_KEY || "local",
    model = process.env.OPENWEIGHT_MODEL || "gemma2:9b"
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>> {
    const startTime = Date.now();
    const timeout = req.timeoutMs ?? 15000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const messages = [
        ...(req.systemPrompt
          ? [{ role: "system", content: req.systemPrompt }]
          : []),
        {
          role: "user",
          content:
            typeof req.input === "string"
              ? req.input
              : JSON.stringify(req.input),
        },
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: req.maxTokens ?? 1024,
          temperature: 0.2,
          response_format: req.schema ? { type: "json_object" } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        logger.error("LLM Provider HTTP error", {
          taskId: req.task,
          statusCode: response.status,
          latencyMs,
        });
        return {
          ok: false,
          reason: `HTTP ${response.status}: ${errorText.slice(0, 100)}`,
          retryable: response.status >= 500,
          latencyMs,
        };
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content ?? "";

      let parsedData: unknown = content;
      if (req.schema) {
        try {
          const rawParsed = JSON.parse(content);
          const validation = req.schema.safeParse(rawParsed);
          if (!validation.success) {
            logger.warn("LLM output schema validation failed", {
              taskId: req.task,
              latencyMs,
            });
            return {
              ok: false,
              reason: `Schema validation failed: ${validation.error.message}`,
              retryable: true,
              latencyMs,
            };
          }
          parsedData = validation.data;
        } catch {
          return {
            ok: false,
            reason: "LLM output is not valid JSON",
            retryable: true,
            latencyMs,
          };
        }
      }

      logger.info("LLM completion successful", {
        taskId: req.task,
        latencyMs,
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens,
      });

      return {
        ok: true,
        data: parsedData as T,
        latencyMs,
        usage: json.usage
          ? {
              promptTokens: json.usage.prompt_tokens,
              completionTokens: json.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (err) {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      const isTimeout = (err as Error).name === "AbortError";

      logger.error("LLM request failed", {
        taskId: req.task,
        latencyMs,
        isTimeout,
      });

      return {
        ok: false,
        reason: isTimeout ? "LLM request timed out" : (err as Error).message,
        retryable: true,
        latencyMs,
      };
    }
  }
}
