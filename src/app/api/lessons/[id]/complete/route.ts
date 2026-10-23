import { NextResponse } from "next/server";
import { LessonCompletionPayloadSchema } from "@/content/tech-bites/lesson-schema";
import { completeLessonSession } from "@/modules/tech-bites/services/lesson-service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const payload = LessonCompletionPayloadSchema.parse({
      ...json,
      lessonId: params.id,
    });

    const result = await completeLessonSession({ payload });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid completion payload", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Failed to complete lesson" },
      { status: 500 }
    );
  }
}
