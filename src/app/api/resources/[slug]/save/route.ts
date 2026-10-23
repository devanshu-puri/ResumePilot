import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { libraryService } from "@/modules/library/services/library-service";
import { AppError } from "@/shared/errors/app-error";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireUser(req);
    const isSaved = await libraryService.toggleSave(user.id, params.slug);
    return NextResponse.json({ isSaved }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
