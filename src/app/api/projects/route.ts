import { NextResponse } from "next/server";
import { DEFAULT_SAMPLE_PROJECT } from "@/content/projects/sample-project-data";
import { generateProjectQuestions } from "@/content/projects/project-question-generator";
import { requireUser } from "@/shared/auth/user";
import { resumeService } from "@/modules/resume/services/resume-service";
import { ParsedProject } from "@/content/projects/project-panel-schema";

export async function GET(req: Request) {
  try {
    let projects: ParsedProject[] = [DEFAULT_SAMPLE_PROJECT];

    try {
      const user = await requireUser(req);
      const active = await resumeService.getActiveResume(user.id);
      if (active && active.projects && active.projects.length > 0) {
        projects = active.projects.map((p, idx) => ({
          id: p.id || `proj_${idx}`,
          name: p.title || `Project ${idx + 1}`,
          role: p.role || "Software Engineer",
          summary: p.description || "Core engineering project implementation.",
          techStack:
            p.techStack && p.techStack.length > 0
              ? p.techStack
              : active.topics.map((t) => t.name),
          metrics:
            p.metrics && p.metrics.length > 0
              ? p.metrics
              : ["Production-ready", "High reliability"],
          responsibilities: p.responsibilities || [],
        }));
      }
    } catch {
      // Fallback to sample project
    }

    const activeProject = projects[0];
    const questions = generateProjectQuestions(activeProject);

    return NextResponse.json({
      projects,
      questions,
      activeProjectId: activeProject.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch project defense questions" },
      { status: 500 }
    );
  }
}
