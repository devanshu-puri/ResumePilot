import { describe, it, expect } from "vitest";
import { AppError } from "@/shared/errors/app-error";
import { sanitizeLogData } from "@/shared/logging/logger";

describe("Error Model & Redacting Logger (FND-T6)", () => {
  describe("AppError", () => {
    it("creates typed operational errors with expected status codes", () => {
      const unauth = AppError.unauthorized();
      expect(unauth.statusCode).toBe(401);
      expect(unauth.code).toBe("UNAUTHORIZED");

      const notFound = AppError.notFound();
      expect(notFound.statusCode).toBe(404);
      expect(notFound.code).toBe("NOT_FOUND");

      const validation = AppError.validation("Invalid claim structure", { field: "quote" });
      expect(validation.statusCode).toBe(422);
      expect(validation.code).toBe("VALIDATION_ERROR");
      expect(validation.details).toEqual({ field: "quote" });
    });

    it("hides internal error details in safe response (FND-3 / I-05)", () => {
      const internal = AppError.internal("Database connection timeout at 10.0.0.1:5432");
      const safe = internal.toSafeResponse();

      expect(safe.code).toBe("INTERNAL_ERROR");
      expect(safe.message).toBe("An internal server error occurred. Please try again later.");
      expect((safe as Record<string, unknown>).details).toBeUndefined();
    });
  });

  describe("Redacting Logger", () => {
    it("redacts fields named text, answer, and resume (I-08)", () => {
      const sensitiveData = {
        userId: "user-123",
        latencyMs: 42,
        text: "Senior React Developer with 5 years experience",
        answer: "SELECT * FROM users WHERE id = 1;",
        resume: "My full confidential career details...",
        nested: {
          rawText: "Secret project notes",
          safeKey: "public-tag",
        },
      };

      const sanitized = sanitizeLogData(sensitiveData) as Record<string, unknown>;

      expect(sanitized.userId).toBe("user-123");
      expect(sanitized.latencyMs).toBe(42);
      expect(sanitized.text).toBe("[REDACTED]");
      expect(sanitized.answer).toBe("[REDACTED]");
      expect(sanitized.resume).toBe("[REDACTED]");

      const nested = sanitized.nested as Record<string, unknown>;
      expect(nested.rawText).toBe("[REDACTED]");
      expect(nested.safeKey).toBe("public-tag");
    });
  });
});
