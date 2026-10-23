import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { libraryService } from "@/modules/library/services/library-service";
import { defaultRateLimiter } from "@/shared/security/rate-limit";
import { AppError } from "@/shared/errors/app-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser(req);
    defaultRateLimiter.enforce(`${user.id}:submit-attempt`, 30, 60000);

    const body = await req.json();

    const attempt = await libraryService.submitAttempt(
      user.id,
      params.id,
      body.responsePayload || {}
    );

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
