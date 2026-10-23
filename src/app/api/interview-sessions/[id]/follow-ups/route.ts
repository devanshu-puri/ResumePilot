import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { interviewService } from "@/modules/interview/services/interview-service";
import { AppError } from "@/shared/errors/app-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    const body = await req.json();

    const followUp = await interviewService.triggerFollowUp(
      user.id,
      params.id,
      body.responseId
    );

    return NextResponse.json({ followUp }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
