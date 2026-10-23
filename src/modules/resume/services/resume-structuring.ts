import { z } from "zod";
import { LlmGateway } from "@/shared/llm/gateway";
import { locateQuote, QuoteOffset } from "../domain/locate-quote";
import { resolveTopic, ResolvedTopic } from "../domain/topic-mapper";

// Strict schema for LLM structured extraction (RES-T4)
// Flexible schemas supporting both standard keys and minor LLM variations
const FlexibleSectionSchema = z.object({
  sectionType: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
}).transform((val) => ({
  sectionType: val.sectionType || val.type || "section",
  title: val.title || val.name || "Section",
}));

const FlexibleProjectSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
}).transform((val) => ({
  title: val.title || val.name || "Project",
  role: val.role || "Software Engineer",
  description: val.description || val.summary || "",
  techStack: val.techStack || val.technologies || [],
  metrics: val.metrics || [],
  responsibilities: val.responsibilities || [],
}));

const ValidClaimTypes = [
  "project_implementation",
  "technology_used",
  "system_architecture",
  "performance_optimization",
  "domain_knowledge",
] as const;

const FlexibleClaimSchema = z.object({
  claimType: z.string().optional(),
  type: z.string().optional(),
  claimText: z.string().optional(),
  text: z.string().optional(),
  claim: z.string().optional(),
  quoteText: z.string().optional(),
  quote: z.string().optional(),
  sourceQuote: z.string().optional(),
  projectTitle: z.string().optional(),
  project: z.string().optional(),
  skillNames: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
}).transform((val) => {
  const rawType = (val.claimType || val.type || "project_implementation") as any;
  const claimType = ValidClaimTypes.includes(rawType) ? rawType : "project_implementation";

  return {
    claimType,
    claimText: val.claimText || val.text || val.claim || "",
    quoteText: val.quoteText || val.quote || val.sourceQuote || "",
    projectTitle: val.projectTitle || val.project,
    skillNames: val.skillNames || val.skills,
  };
});

// Strict schema for LLM structured extraction (RES-T4)
export const ResumeExtractionSchema = z.object({
  sections: z.array(FlexibleSectionSchema).default([]),
  projects: z.array(FlexibleProjectSchema).default([]),
  skills: z.array(z.string()).default([]),
  claims: z.array(FlexibleClaimSchema).default([]),
});

export type StructuredResumeOutput = z.infer<typeof ResumeExtractionSchema>;

export interface VerifiedClaim {
  claimType: "project_implementation" | "technology_used" | "system_architecture" | "performance_optimization" | "domain_knowledge";
  claimText: string;
  quoteText: string;
  sourceStartOffset: number;
  sourceEndOffset: number;
  projectTitle?: string;
  topics: ResolvedTopic[];
}

export interface StructuringResult {
  sections: { sectionType: string; title: string }[];
  projects: {
    title: string;
    role?: string;
    description: string;
    techStack?: string[];
    metrics?: string[];
    responsibilities?: string[];
  }[];
  topics: ResolvedTopic[];
  claims: VerifiedClaim[];
  discardedClaimsCount: number;
}

/**
 * System prompt framing resume text strictly as untrusted data (RES-T4, Invariant I-06).
 */
export const RESUME_STRUCTURING_SYSTEM_PROMPT = `
You are an expert technical resume parser for an interview preparation system.
Your job is to extract sections, projects, technical skills, and verifiable claims from the provided resume text.

OUTPUT STRICTLY VALID JSON WITH THIS STRUCTURE:
{
  "sections": [
    { "sectionType": "experience", "title": "Experience" }
  ],
  "projects": [
    {
      "title": "Project or Company Name",
      "role": "Role (e.g. Backend Engineer)",
      "description": "1-2 sentence overview of the project",
      "techStack": ["React", "TypeScript", "Node.js", "Redis"],
      "metrics": ["12,000 req/sec", "35% latency reduction"],
      "responsibilities": ["Architected caching layer", "Optimized queries"]
    }
  ],
  "skills": ["TypeScript", "React", "PostgreSQL", "Redis", "Docker", "Go"],
  "claims": [
    {
      "claimType": "project_implementation",
      "claimText": "Built event notification service using TypeScript and Redis",
      "quoteText": "Designed and built a high-throughput event notification service using TypeScript and Redis, processing 12,000 events/second.",
      "projectTitle": "Acme Corp",
      "skillNames": ["TypeScript", "Redis"]
    }
  ]
}

CRITICAL RULES:
1. "claimType" must be one of: "project_implementation" | "technology_used" | "system_architecture" | "performance_optimization" | "domain_knowledge".
2. "quoteText" MUST match the exact text inside the resume verbatim so character offsets can be located.
3. Standalone skills list items (e.g. "Skills: React, Node, Docker") belong under "skills" ONLY. They MUST NOT generate claims.
`.trim();

/**
 * Parses raw extracted resume text via LlmGateway and validates exact quote offsets (RES-T4).
 */
export async function structureResumeText(
  rawText: string,
  gateway: LlmGateway
): Promise<StructuringResult> {
  const result = await gateway.complete({
    task: "resume_structuring",
    systemPrompt: RESUME_STRUCTURING_SYSTEM_PROMPT,
    input: {
      instruction: "Extract sections, projects, skills, and claims from the resume text below.",
      untrustedResumeText: rawText,
    },
    schema: ResumeExtractionSchema,
  });

  if (!result.ok) {
    throw new Error(`LLM Structuring failed: ${result.reason}`);
  }

  const structured = result.data;

  const sections = structured.sections ?? [];
  const projects = structured.projects ?? [];
  const skills = structured.skills ?? [];
  const candidateClaims = structured.claims ?? [];

  // 1. Resolve skills to topics (RES-T5)
  const topicMap = new Map<string, ResolvedTopic>();
  for (const rawSkill of skills) {
    const resolved = resolveTopic(rawSkill);
    topicMap.set(resolved.slug, resolved);
  }

  // 2. Validate quotes and compute exact offsets in rawText (RES-T3, ADR-3)
  const verifiedClaims: VerifiedClaim[] = [];
  let discardedCount = 0;

  for (const candidateClaim of candidateClaims) {
    const offset: QuoteOffset | null = locateQuote(
      rawText,
      candidateClaim.quoteText,
      0
    );

    if (!offset) {
      // Discard claims where quote does not exist in source text (PRD RES-4)
      discardedCount++;
      continue;
    }

    // Resolve associated skills/topics for this claim
    const claimTopics: ResolvedTopic[] = [];
    if (candidateClaim.skillNames) {
      for (const s of candidateClaim.skillNames) {
        const res = resolveTopic(s);
        claimTopics.push(res);
        if (!topicMap.has(res.slug)) {
          topicMap.set(res.slug, res);
        }
      }
    }

    verifiedClaims.push({
      claimType: candidateClaim.claimType,
      claimText: candidateClaim.claimText,
      quoteText: candidateClaim.quoteText,
      sourceStartOffset: offset.startOffset,
      sourceEndOffset: offset.endOffset,
      projectTitle: candidateClaim.projectTitle,
      topics: claimTopics,
    });
  }

  return {
    sections,
    projects,
    topics: Array.from(topicMap.values()),
    claims: verifiedClaims,
    discardedClaimsCount: discardedCount,
  };
}
