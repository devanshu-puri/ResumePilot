"use client";

import React, { useState, useEffect } from "react";
import { SkillDrillsRunner } from "@/components/drills/skill-drills-runner";

export default function SkillDrillsPage() {
  const [skills, setSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "PostgreSQL",
    "Redis",
    "System Design",
  ]);

  useEffect(() => {
    // Attempt to pull parsed skills from active resume
    async function loadResumeSkills() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          if (data?.resume?.topics && data.resume.topics.length > 0) {
            const extracted = data.resume.topics.map((t: any) => t.name || t.slug);
            const combined = Array.from(new Set([...extracted, ...skills]));
            setSkills(combined);
          }
        }
      } catch {
        // Fallback default skills
      }
    }
    loadResumeSkills();
  }, []);

  return <SkillDrillsRunner parsedSkills={skills} />;
}
