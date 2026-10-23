import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { interviewService } from "@/modules/interview/services/interview-service";
import { defaultRateLimiter } from "@/shared/security/rate-limit";
import { AppError } from "@/shared/errors/app-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    defaultRateLimiter.enforce(`${user.id}:evaluate-response`, 30, 60000);

    const body = await req.json();

    const result = await interviewService.submitResponse(
      user.id,
      params.id,
      body.questionId,
      body.responseText,
      body.answerFormat || "text"
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
