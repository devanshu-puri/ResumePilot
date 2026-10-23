/**
 * Redacting logger conforming to FND-T6 and Invariant I-08:
 * "No resume/answer content in logs."
 *
 * Rejects or strips fields named `text`, `answer`, `resume`,
 * or variants containing user submitted text.
 */

const FORBIDDEN_LOG_FIELDS = new Set([
  "text",
  "answer",
  "resume",
  "rawtext",
  "responsetext",
  "quotetext",
  "claimtext",
  "password",
  "secret",
  "token",
]);

export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_LOG_FIELDS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeLogData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return data;
}

export interface LogMetadata {
  taskId?: string;
  userId?: string;
  latencyMs?: number;
  statusCode?: number;
  [key: string]: unknown;
}

export const logger = {
  info(message: string, meta?: LogMetadata) {
    const sanitized = sanitizeLogData(meta);
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({ level: "INFO", message, meta: sanitized, timestamp: new Date().toISOString() }));
    }
  },

  warn(message: string, meta?: LogMetadata) {
    const sanitized = sanitizeLogData(meta);
    if (process.env.NODE_ENV !== "test") {
      console.warn(JSON.stringify({ level: "WARN", message, meta: sanitized, timestamp: new Date().toISOString() }));
    }
  },

  error(message: string, meta?: LogMetadata) {
    const sanitized = sanitizeLogData(meta);
    if (process.env.NODE_ENV !== "test") {
      console.error(JSON.stringify({ level: "ERROR", message, meta: sanitized, timestamp: new Date().toISOString() }));
    }
  },
};
