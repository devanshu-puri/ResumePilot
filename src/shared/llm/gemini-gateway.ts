import { z } from "zod";
import { LlmGateway, LlmCompletionRequest, LlmCompletionResult } from "./gateway";
import { logger } from "@/shared/logging/logger";

/**
 * Dedicated Google Gemini API Adapter (Google AI Studio).
 * Uses native generateContent with responseMimeType: "application/json".
 */
export class GeminiLlmGateway implements LlmGateway {
  private apiKey: string;
  private model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY || "",
    model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
  ) {
    this.apiKey = apiKey.trim();
    this.model = model.trim();
  }

  async complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>> {
    const startTime = Date.now();
    const timeout = req.timeoutMs ?? 30000;

    const key = this.apiKey || process.env.GEMINI_API_KEY || "";
    if (!key) {
      return {
        ok: false,
        reason: "GEMINI_API_KEY is not configured. Please add your key to .env.",
        retryable: false,
        latencyMs: 0,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key}`;

      const userContent =
        typeof req.input === "string" ? req.input : JSON.stringify(req.input, null, 2);

      const requestBody: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: userContent }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      };

      if (req.systemPrompt) {
        requestBody.system_instruction = {
          parts: [{ text: req.systemPrompt }],
        };
      }

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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (res.ok) {
          responseData = await res.json();
          this.model = m;
          break;
        } else {
          const errText = await res.text().catch(() => "");
          lastError = `Gemini API HTTP ${res.status}: ${errText.slice(0, 150)}`;
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

      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return {
          ok: false,
          reason: "Empty response from Gemini API",
          retryable: true,
          latencyMs,
        };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Strip markdown code fences if present (```json ... ```)
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/```$/i, "")
          .trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          return {
            ok: false,
            reason: `Gemini output is not valid JSON: ${rawText.slice(0, 100)}`,
            retryable: true,
            latencyMs,
          };
        }
      }

      if (req.schema) {
        const validated = req.schema.safeParse(parsed);
        if (!validated.success) {
          console.warn("Gemini output schema mismatch:", validated.error.message, "raw output:", JSON.stringify(parsed).slice(0, 500));
          logger.warn("Gemini output schema mismatch", {
            taskId: req.task,
            error: validated.error.message,
          });
          return {
            ok: false,
            reason: `Schema validation failed: ${validated.error.message}`,
            retryable: true,
            latencyMs,
          };
        }
        parsed = validated.data;
      }

      logger.info("Gemini API completed task", {
        taskId: req.task,
        latencyMs,
      });

      return {
        ok: true,
        data: parsed as T,
        latencyMs,
      };
    } catch (err) {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      return {
        ok: false,
        reason: (err as Error).message,
        retryable: true,
        latencyMs,
      };
    }
  }
}
