import { NextResponse } from "next/server";
import { VERIFIED_DRILL_QUESTIONS } from "@/content/drills/drill-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill")?.toLowerCase();
    const difficulty = searchParams.get("difficulty");

    let questions = VERIFIED_DRILL_QUESTIONS;

    if (skill) {
      questions = questions.filter((q) => q.skillId.toLowerCase() === skill);
    }

    if (difficulty && difficulty !== "mixed") {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    return NextResponse.json({
      questions,
      total: questions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch drill questions" },
      { status: 500 }
    );
  }
}
