import { z } from "zod";
import { LlmGateway, LlmCompletionRequest, LlmCompletionResult } from "./gateway";
import { logger } from "@/shared/logging/logger";

/**
 * Google AI Studio Gemini Gateway (GEMINI / Google Studio API).
 * Leverages Google's fast generative language models (e.g. gemini-3.5-flash-lite, gemini-3.8-flash, gemini-1.5-flash).
 */
export class GeminiLlmGateway implements LlmGateway {
  private apiKey: string;
  private model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY || "",
    model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
  ) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>> {
    const startTime = Date.now();
    const timeout = req.timeoutMs ?? 25000;

    if (!this.apiKey) {
      return {
        ok: false,
        reason: "GEMINI_API_KEY is not configured",
        retryable: false,
        latencyMs: 0,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const inputText =
        typeof req.input === "string" ? req.input : JSON.stringify(req.input, null, 2);

      const requestBody: Record<string, unknown> = {
        contents: [
          {
            parts: [{ text: inputText }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: req.maxTokens ?? 2048,
          ...(req.schema ? { responseMimeType: "application/json" } : {}),
        },
      };

      if (req.systemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: req.systemPrompt }],
        };
      }

      // Try designated model, fall back gracefully if model name is superseded
      const modelCandidates = [
        this.model,
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-1.5-flash",
      ];
      const uniqueModels = Array.from(new Set(modelCandidates));

      let lastError = "";
      let responseData: any = null;

      for (const m of uniqueModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${this.apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (res.ok) {
          responseData = await res.json();
          this.model = m; // Remember working model
          break;
        } else {
          const errText = await res.text().catch(() => "");
          lastError = `HTTP ${res.status}: ${errText.slice(0, 150)}`;
          // If 404 (model retired/unavailable), loop to try next model in fallback list
          if (res.status !== 404) {
            break;
          }
        }
      }

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (!responseData) {
        logger.error("Gemini API error", {
          taskId: req.task,
          lastError,
          latencyMs,
        });
        return {
          ok: false,
          reason: lastError || "Failed to receive response from Gemini API",
          retryable: true,
          latencyMs,
        };
      }

      const textOutput =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      let parsedData: unknown = textOutput;

      if (req.schema) {
        try {
          // Clean possible markdown code fences if model wrapped json in ```json ... ```
          const sanitized = textOutput
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

          const rawParsed = JSON.parse(sanitized);
          const validation = req.schema.safeParse(rawParsed);

          if (!validation.success) {
            logger.warn("Gemini output schema validation failed", {
              taskId: req.task,
              latencyMs,
              issues: validation.error.issues,
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
            reason: "Gemini output is not valid JSON",
            retryable: true,
            latencyMs,
          };
        }
      }

      logger.info("Gemini completion successful", {
        taskId: req.task,
        latencyMs,
        model: this.model,
      });

      return {
        ok: true,
        data: parsedData as T,
        latencyMs,
      };
    } catch (err) {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      const isTimeout = (err as Error).name === "AbortError";

      logger.error("Gemini request exception", {
        taskId: req.task,
        latencyMs,
        isTimeout,
        error: (err as Error).message,
      });

      return {
        ok: false,
        reason: isTimeout ? "Gemini request timed out" : (err as Error).message,
        retryable: true,
        latencyMs,
      };
    }
  }
}
