import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { libraryService } from "@/modules/library/services/library-service";
import { AppError } from "@/shared/errors/app-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await requireUser(req).catch(() => null);

    const topicSlug = searchParams.get("topicSlug") || undefined;
    const resourceType = searchParams.get("resourceType") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const search = searchParams.get("search") || undefined;
    const savedOnly = searchParams.get("savedOnly") === "true";

    const data = await libraryService.getResources({
      topicSlug,
      resourceType,
      difficulty,
      search,
      savedOnly,
      userId: user?.id,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
