import { AppError } from "@/shared/errors/app-error";

/**
 * Repository convention helper enforcing Invariant I-07:
 * "Every repository query is scoped by userId."
 */
export function ensureUserId(userId: string | undefined | null): string {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw AppError.unauthorized("A valid userId is mandatory for all repository operations");
  }
  return userId;
}

export function scopeWhere<T extends Record<string, unknown>>(
  userId: string,
  where?: T
): T & { userId: string } {
  const validUserId = ensureUserId(userId);
  return {
    ...(where as T),
    userId: validUserId,
  };
}
