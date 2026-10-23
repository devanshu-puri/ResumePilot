import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { interviewService } from "@/modules/interview/services/interview-service";
import { defaultRateLimiter } from "@/shared/security/rate-limit";
import { AppError } from "@/shared/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    defaultRateLimiter.enforce(`${user.id}:create-session`, 20, 60000);

    const body = await req.json();

    const session = await interviewService.createSession(user.id, {
      sessionType: body.sessionType || "challenge",
      targetRole: body.targetRole || "Software Engineer",
      difficulty: body.difficulty || "intermediate",
      claims: body.claims,
      topicSlugs: body.topicSlugs,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
