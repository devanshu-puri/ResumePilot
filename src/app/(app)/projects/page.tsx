"use client";

import React, { useState, useEffect } from "react";
import { ProjectInterviewPanel } from "@/components/projects/project-interview-panel";
import { DEFAULT_SAMPLE_PROJECT } from "@/content/projects/sample-project-data";
import { ParsedProject } from "@/content/projects/project-panel-schema";

export default function ProjectInterviewPage() {
  const [projects, setProjects] = useState<ParsedProject[]>([DEFAULT_SAMPLE_PROJECT]);

  useEffect(() => {
    // Attempt to pull parsed projects from active resume
    async function loadResumeProjects() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          if (data?.resume?.projects && data.resume.projects.length > 0) {
            const resumeSkills = data.resume.topics?.map((t: any) => t.name) || [
              "TypeScript",
              "React",
              "Node.js",
              "PostgreSQL",
            ];
            const mapped: ParsedProject[] = data.resume.projects.map((p: any, idx: number) => ({
              id: p.id || `proj_${idx}`,
              name: p.title || p.name || `Project ${idx + 1}`,
              role: p.role || "Software Engineer",
              summary: p.description || p.summary || "Core engineering project implementation.",
              techStack: p.techStack && p.techStack.length > 0 ? p.techStack : resumeSkills,
              metrics: p.metrics && p.metrics.length > 0 ? p.metrics : ["Production-grade", "Scalable"],
              responsibilities: p.responsibilities || [],
            }));
            setProjects(mapped);
          }
        }
      } catch {
        // Fallback to sample project
      }
    }
    loadResumeProjects();
  }, []);

  return <ProjectInterviewPanel projects={projects} />;
}
