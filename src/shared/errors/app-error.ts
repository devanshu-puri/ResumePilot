export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "UNREADABLE_RESUME"
  | "LLM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 500,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "You do not have access to this resource"): AppError {
    return new AppError("FORBIDDEN", message, 403);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError("NOT_FOUND", message, 404);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError("BAD_REQUEST", message, 402, true, details);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError("VALIDATION_ERROR", message, 422, true, details);
  }

  static rateLimited(message = "Too many requests. Please slow down."): AppError {
    return new AppError("RATE_LIMITED", message, 429);
  }

  static unreadableResume(message = "Unable to extract readable text from resume file."): AppError {
    return new AppError("UNREADABLE_RESUME", message, 422);
  }

  static llmUnavailable(message = "Language model service is currently unavailable."): AppError {
    return new AppError("LLM_UNAVAILABLE", message, 503);
  }

  static internal(message = "An unexpected error occurred"): AppError {
    return new AppError("INTERNAL_ERROR", message, 500, false);
  }

  /**
   * Transforms error into safe client JSON response.
   * Internal errors never leak internal stack traces or database messages (Invariant I-05, FND-3).
   */
  toSafeResponse(): { code: ErrorCode; message: string; details?: unknown } {
    if (!this.isOperational && this.statusCode === 500) {
      return {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred. Please try again later.",
      };
    }

    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
