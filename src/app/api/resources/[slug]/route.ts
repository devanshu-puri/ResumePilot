import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { libraryService } from "@/modules/library/services/library-service";
import { AppError } from "@/shared/errors/app-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireUser(req).catch(() => null);
    const resource = await libraryService.getResource(params.slug, user?.id);
    return NextResponse.json({ resource }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
