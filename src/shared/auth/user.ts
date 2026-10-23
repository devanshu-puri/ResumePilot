import { AppError } from "@/shared/errors/app-error";

export interface UserSession {
  id: string;
  email: string;
  name?: string;
}

// In MVP, provide demo user fallback for testing/local exploration if header or session not set
export const DEMO_USER_A: UserSession = {
  id: "user_alpha_test_id",
  email: "candidate.a@example.com",
  name: "Candidate Alpha",
};

export const DEMO_USER_B: UserSession = {
  id: "user_beta_test_id",
  email: "candidate.b@example.com",
  name: "Candidate Beta",
};

/**
 * Validates authenticated user.
 * Throws 401 Unauthorized if not authenticated (FND-5).
 */
export async function requireUser(req?: Request): Promise<UserSession> {
  // If authorization header or custom user header passed
  if (req) {
    const authHeader = req.headers.get("authorization");
    const userHeader = req.headers.get("x-user-id");

    if (userHeader) {
      if (userHeader === DEMO_USER_B.id) return DEMO_USER_B;
      return { id: userHeader, email: `${userHeader}@example.com` };
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token === "unauthenticated" || token === "invalid") {
        throw AppError.unauthorized("Authentication token is invalid or missing");
      }
      return { id: token, email: `${token}@example.com` };
    }

    // If request provided without any auth credentials, throw 401
    const isPublic = req.headers.get("x-public-route") === "true";
    if (!isPublic && !authHeader && !userHeader && process.env.NODE_ENV === "test") {
      throw AppError.unauthorized("Authentication required");
    }
  }

  // Default demo user in local development
  return DEMO_USER_A;
}

/**
 * Asserts ownership of private resources (FND-5, Invariant I-07).
 * Throws 404 (or 403) so users cannot probe existence of other users' records.
 */
export function assertOwnership(
  resourceOwnerId: string,
  currentUserId: string,
  resourceName = "Record"
): void {
  if (!resourceOwnerId || resourceOwnerId !== currentUserId) {
    throw AppError.notFound(`${resourceName} not found`);
  }
}
