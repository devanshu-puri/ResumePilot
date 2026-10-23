import { AppError } from "@/shared/errors/app-error";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();

  /**
   * Checks sliding window rate limit for a key (FND-T8).
   * @param key E.g. `${userId}:${route}`
   * @param maxRequests Maximum requests allowed within window
   * @param windowMs Time window in milliseconds (default 60s)
   */
  check(key: string, maxRequests: number, windowMs = 60000): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, oldest + windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Enforces rate limit and throws AppError if exceeded.
   */
  enforce(key: string, maxRequests: number, windowMs = 60000): void {
    const res = this.check(key, maxRequests, windowMs);
    if (!res.allowed) {
      throw AppError.rateLimited(
        `Rate limit exceeded. Try again in ${Math.ceil(res.resetMs / 1000)} seconds.`
      );
    }
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const defaultRateLimiter = new MemoryRateLimiter();
