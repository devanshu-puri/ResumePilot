import { NextResponse } from "next/server";
import { DEFAULT_SAMPLE_PROJECT } from "@/content/projects/sample-project-data";
import { generateProjectQuestions } from "@/content/projects/project-question-generator";

export async function GET(req: Request) {
  try {
    const sample = DEFAULT_SAMPLE_PROJECT;
    const questions = generateProjectQuestions(sample);

    return NextResponse.json({
      projects: [sample],
      questions,
      activeProjectId: sample.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch project defense questions" },
      { status: 500 }
    );
  }
}
