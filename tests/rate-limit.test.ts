import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRateLimiter } from "@/shared/security/rate-limit";
import { AppError } from "@/shared/errors/app-error";

describe("Rate Limiting Utility (FND-T8)", () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    limiter = new MemoryRateLimiter();
  });

  it("allows requests under the rate limit within window", () => {
    const key = "user-1:/api/resumes";
    const res1 = limiter.check(key, 3, 5000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check(key, 3, 5000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check(key, 3, 5000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request exceeds
    const res4 = limiter.check(key, 3, 5000);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
  });

  it("enforces rate limits and throws 429 AppError when exceeded", () => {
    const key = "user-2:/api/interview";
    limiter.enforce(key, 2, 5000);
    limiter.enforce(key, 2, 5000);

    expect(() => limiter.enforce(key, 2, 5000)).toThrow(AppError);
    expect(() => limiter.enforce(key, 2, 5000)).toThrowError(/rate limit exceeded/i);
  });

  it("maintains separate limits for different users and routes", () => {
    limiter.check("user-a:/api/evaluate", 1, 5000);
    const blockedA = limiter.check("user-a:/api/evaluate", 1, 5000);
    expect(blockedA.allowed).toBe(false);

    // user-b is still allowed
    const allowedB = limiter.check("user-b:/api/evaluate", 1, 5000);
    expect(allowedB.allowed).toBe(true);
  });
});
