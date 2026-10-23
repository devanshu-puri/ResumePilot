import { NextResponse } from "next/server";
import { getAllLessons, getLessonsByPath } from "@/content/tech-bites/lessons";
import { LessonPath, LessonPathSchema } from "@/content/tech-bites/lesson-schema";
import { isLessonBookmarked, isLessonCompleted } from "@/modules/tech-bites/services/lesson-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pathParam = searchParams.get("path");
    const searchParam = searchParams.get("search")?.toLowerCase();

    let lessons = getAllLessons();

    if (pathParam && LessonPathSchema.safeParse(pathParam).success) {
      lessons = getLessonsByPath(pathParam as LessonPath);
    }

    if (searchParam) {
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(searchParam) ||
          l.outcome.toLowerCase().includes(searchParam) ||
          l.paths.some((p) => p.toLowerCase().includes(searchParam))
      );
    }

    // Attach completion & bookmark metadata
    const enriched = lessons.map((l) => ({
      ...l,
      isCompleted: isLessonCompleted(l.id),
      isBookmarked: isLessonBookmarked(l.id),
      totalDurationMinutes: l.steps.reduce((acc, s) => acc + s.durationMinutes, 0),
    }));

    return NextResponse.json({ lessons: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
