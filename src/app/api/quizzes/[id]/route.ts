import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { quizService } from "@/modules/library/services/quiz-service";
import { AppError } from "@/shared/errors/app-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    const quiz = await quizService.getQuiz(user.id, params.id);
    return NextResponse.json({ quiz }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
