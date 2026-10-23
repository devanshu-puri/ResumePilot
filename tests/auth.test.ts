import { describe, it, expect } from "vitest";
import { requireUser, assertOwnership, DEMO_USER_A, DEMO_USER_B } from "@/shared/auth/user";
import { ensureUserId, scopeWhere } from "@/shared/auth/repository-helper";
import { AppError } from "@/shared/errors/app-error";

describe("Auth & Ownership Helpers (FND-T5)", () => {
  it("throws 401 Unauthorized for unauthenticated requests", async () => {
    const fakeRequest = new Request("http://localhost/api/resumes", {
      headers: {
        authorization: "Bearer invalid",
      },
    });

    await expect(requireUser(fakeRequest)).rejects.toThrow(AppError);
    await expect(requireUser(fakeRequest)).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("authenticates valid users via headers", async () => {
    const req = new Request("http://localhost/api/resumes", {
      headers: {
        "x-user-id": DEMO_USER_B.id,
      },
    });

    const user = await requireUser(req);
    expect(user.id).toBe(DEMO_USER_B.id);
  });

  it("prevents user A from accessing user B's records (assertOwnership)", () => {
    const userARecordOwner = DEMO_USER_A.id;
    const userBId = DEMO_USER_B.id;

    // Allowed for owner
    expect(() => assertOwnership(userARecordOwner, DEMO_USER_A.id)).not.toThrow();

    // Throws 404 (or 403) for non-owner
    expect(() => assertOwnership(userARecordOwner, userBId)).toThrow(AppError);
    expect(() => assertOwnership(userARecordOwner, userBId)).toThrowError(/not found/i);
  });

  it("enforces mandatory userId in repository queries (Invariant I-07)", () => {
    expect(() => ensureUserId("")).toThrow(AppError);
    expect(() => ensureUserId(undefined)).toThrow(AppError);
    expect(ensureUserId("valid-user-123")).toBe("valid-user-123");

    const query = scopeWhere("user-456", { status: "active" });
    expect(query).toEqual({ status: "active", userId: "user-456" });
  });
});
