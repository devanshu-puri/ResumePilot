import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { interviewService } from "@/modules/interview/services/interview-service";
import { AppError } from "@/shared/errors/app-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    const session = await interviewService.getSession(user.id, params.id);
    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    const body = await req.json();

    const session = await interviewService.updateSessionState(user.id, params.id, {
      type: body.action,
    });

    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
