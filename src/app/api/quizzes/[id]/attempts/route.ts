import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { quizService } from "@/modules/library/services/quiz-service";
import { AppError } from "@/shared/errors/app-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    const body = await req.json();

    if (!body.answers || typeof body.answers !== "object") {
      throw AppError.badRequest("Request body must contain an 'answers' map.");
    }

    const result = await quizService.submitQuiz(user.id, params.id, body.answers);
    return NextResponse.json({ attempt: result }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
