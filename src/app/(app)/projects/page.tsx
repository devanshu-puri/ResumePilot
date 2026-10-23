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
            const mapped: ParsedProject[] = data.resume.projects.map((p: any, idx: number) => ({
              id: p.id || `proj_${idx}`,
              name: p.title || p.name || "Resume Project",
              role: p.role || "Software Engineer",
              summary: p.description || p.summary || "Core full-stack engineering project implementation.",
              techStack: p.techStack || ["TypeScript", "React", "Node.js", "PostgreSQL"],
              metrics: p.metrics || ["Production-ready", "High reliability"],
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
