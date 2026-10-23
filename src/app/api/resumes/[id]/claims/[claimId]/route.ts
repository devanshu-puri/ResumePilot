import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { resumeService } from "@/modules/resume/services/resume-service";
import { AppError } from "@/shared/errors/app-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; claimId: string } }
) {
  try {
    const user = await requireUser(req);
    const body = await req.json();

    const updated = await resumeService.updateClaim(
      user.id,
      params.id,
      params.claimId,
      {
        claimText: body.claimText,
        userConfirmed: body.userConfirmed,
        excluded: body.excluded,
      }
    );

    return NextResponse.json({ resume: updated }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
