import { NextResponse } from "next/server";
import { getLessonById } from "@/content/tech-bites/lessons";
import { isLessonBookmarked, isLessonCompleted } from "@/modules/tech-bites/services/lesson-service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = getLessonById(params.id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({
      lesson: {
        ...lesson,
        isCompleted: isLessonCompleted(lesson.id),
        isBookmarked: isLessonBookmarked(lesson.id),
        totalDurationMinutes: lesson.steps.reduce(
          (acc, s) => acc + s.durationMinutes,
          0
        ),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
