import { LlmGateway, LlmCompletionRequest, LlmCompletionResult } from "./gateway";
import { logger } from "@/shared/logging/logger";

export interface ProgrammedResponse<T = unknown> {
  taskMatch?: string | RegExp;
  data?: T;
  rawJson?: string;
  failReason?: string;
  retryable?: boolean;
  delayMs?: number;
}

/**
 * Fake implementation of LlmGateway for tests, CI, and reproducible evals (FND-T7).
 */
export class FakeLlmGateway implements LlmGateway {
  private programmedResponses: ProgrammedResponse[] = [];
  public callCount = 0;
  public lastRequest?: LlmCompletionRequest;

  /**
   * Program a mock response for a task.
   */
  queueResponse<T>(res: ProgrammedResponse<T>): this {
    this.programmedResponses.push(res);
    return this;
  }

  clearQueue(): void {
    this.programmedResponses = [];
    this.callCount = 0;
    this.lastRequest = undefined;
  }

  async complete<T>(req: LlmCompletionRequest<T>): Promise<LlmCompletionResult<T>> {
    this.callCount++;
    this.lastRequest = req;

    const startTime = Date.now();

    // Check if there is a matching programmed response
    const idx = this.programmedResponses.findIndex((p) => {
      if (!p.taskMatch) return true;
      if (typeof p.taskMatch === "string") return req.task === p.taskMatch;
      return p.taskMatch.test(req.task);
    });

    const mock = idx !== -1 ? this.programmedResponses.splice(idx, 1)[0] : undefined;

    if (mock?.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, mock.delayMs));
    }

    const latencyMs = Date.now() - startTime;

    if (mock?.failReason) {
      logger.warn("FakeLlmGateway simulated failure", {
        taskId: req.task,
        latencyMs,
      });
      return {
        ok: false,
        reason: mock.failReason,
        retryable: mock.retryable ?? true,
        latencyMs,
      };
    }

    let payload: unknown = mock?.data;

    if (payload === undefined && !mock?.rawJson && !mock?.failReason) {
      payload = getDefaultPayloadForTask(req.task, req.input);
    }

    if (mock?.rawJson) {
      try {
        payload = JSON.parse(mock.rawJson);
      } catch {
        return {
          ok: false,
          reason: "Malformed JSON in mock output",
          retryable: true,
          latencyMs,
        };
      }
    }

    // If schema provided, validate against it
    if (req.schema && payload !== undefined) {
      const validation = req.schema.safeParse(payload);
      if (!validation.success) {
        return {
          ok: false,
          reason: `Schema validation failed: ${validation.error.message}`,
          retryable: true,
          latencyMs,
        };
      }
      payload = validation.data;
    }

    logger.info("FakeLlmGateway completed task", {
      taskId: req.task,
      latencyMs,
    });

    return {
      ok: true,
      data: (payload ?? {}) as T,
      latencyMs,
      usage: {
        promptTokens: 120,
        completionTokens: 80,
      },
    };
  }
}

function getDefaultPayloadForTask(task: string, input: any): unknown {
  if (task === "resume_structuring") {
    const rawText = (input?.untrustedResumeText as string) || "";
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const skills: string[] = [
      "TypeScript",
      "JavaScript",
      "React",
      "Node.js",
      "Redis",
      "PostgreSQL",
      "Docker",
      "Git",
      "SQL",
    ];
    const claims: any[] = [];

    // Extract bullet points or substantive statements
    const bulletLines = lines.filter(
      (l) =>
        l.startsWith("-") ||
        l.startsWith("•") ||
        l.startsWith("*") ||
        (l.length > 25 && !l.endsWith(":"))
    );

    const commonTech = [
      "Redis",
      "PostgreSQL",
      "Docker",
      "Kafka",
      "React",
      "Node.js",
      "TypeScript",
      "Go",
      "SQL",
      "JWT",
      "AWS",
      "GraphQL",
      "Python",
      "Kubernetes",
      "Linux",
    ];

    for (const b of bulletLines.slice(0, 10)) {
      const clean = b.replace(/^[-•*]\s*/, "").trim();
      if (clean.length < 15) continue;

      // Extract technologies mentioned in this line
      const matchedTech = commonTech.filter((t) =>
        new RegExp(`\\b${t}\\b`, "i").test(clean)
      );

      let claimType = "technology_used";
      if (/latency|throughput|performance|cache|scal/i.test(clean)) {
        claimType = "performance_optimization";
      } else if (/architect|design|cluster|pipeline|distributed/i.test(clean)) {
        claimType = "system_architecture";
      } else if (/built|implement|deploy|creat/i.test(clean)) {
        claimType = "project_implementation";
      }

      // Verbatim quote: find exact match in rawText
      let quoteText = clean;
      if (!rawText.includes(clean)) {
        // Find longest matching fragment
        for (const line of lines) {
          if (line.includes(clean) || clean.includes(line)) {
            quoteText = line.replace(/^[-•*]\s*/, "").trim();
            break;
          }
        }
      }

      if (rawText.includes(quoteText)) {
        claims.push({
          claimType,
          claimText: clean,
          quoteText,
          skillNames: matchedTech.length > 0 ? matchedTech : ["Software Architecture"],
        });
      }
    }

    // Fallback if no bullet lines matched
    if (claims.length === 0 && rawText.length > 10) {
      const sentence = rawText.slice(0, Math.min(100, rawText.length)).trim();
      claims.push({
        claimType: "project_implementation",
        claimText: sentence,
        quoteText: sentence,
        skillNames: ["Software Engineering"],
      });
    }

    return {
      sections: [
        { sectionType: "experience", title: "Experience" },
        { sectionType: "projects", title: "Projects" },
        { sectionType: "skills", title: "Technical Skills" },
      ],
      projects: [
        { title: "Core Application Service", description: "Production service architecture" },
      ],
      skills,
      claims,
    };
  }

  if (task === "question_generation") {
    const topic = (input?.topic as string) || "System Architecture";
    const claim = (input?.claim as string) || "";
    const prompt =
      claim && claim !== "No specific claim, conceptual inquiry."
        ? `In your work with ${topic}, what architectural trade-offs, concurrency issues, and failure recovery mechanisms did you evaluate?`
        : `Explain the internal architecture, lifecycle mechanics, and performance trade-offs of ${topic} in distributed systems.`;

    return {
      prompt,
      expectedConcepts: [
        `${topic} internal mechanics`,
        "Failure modes and recovery mechanisms",
        "Performance trade-offs vs alternatives",
      ],
      questionType: claim ? "resume_defense" : "conceptual",
      estimatedDurationSeconds: 300,
    };
  }

  if (task === "evaluate_interview_response") {
    const answer =
      typeof input === "string"
        ? input
        : (input?.answer as string) || (input?.responseText as string) || "";
    const wordCount = answer.trim().split(/\s+/).length;

    // Realistic grading
    const score = wordCount > 25 ? 3.4 : wordCount > 10 ? 2.5 : 1.5;
    const rubricId = (input?.rubricId as string) || "";

    const isConceptual = rubricId.includes("conceptual");
    const isCode = rubricId.includes("code");

    const criteriaResults = isConceptual
      ? [
          {
            criterionId: "core_definition",
            score,
            feedback: "Correctly defined foundational concepts and terminology.",
          },
          {
            criterionId: "mechanism_explanation",
            score,
            feedback: "Clear explanation of internal data flow and memory layout.",
          },
          {
            criterionId: "practical_application",
            score: Math.max(0.5, score - 0.2),
            feedback: "Connected principles to real-world engineering constraints.",
          },
        ]
      : isCode
      ? [
          {
            criterionId: "code_correctness",
            score,
            feedback: "Code structure and logic are fundamentally sound.",
          },
          {
            criterionId: "complexity_analysis",
            score,
            feedback: "Correct asymptotic time and space complexity evaluation.",
          },
          {
            criterionId: "refactoring_rationale",
            score: Math.max(0.5, score - 0.2),
            feedback: "Clear justification for refactoring and safety guards.",
          },
        ]
      : [
          {
            criterionId: "technical_accuracy",
            score,
            feedback: "Accurate terminology and description of mechanisms.",
          },
          {
            criterionId: "personal_ownership",
            score,
            feedback: "Demonstrates clear individual reasoning and context.",
          },
          {
            criterionId: "tradeoff_justification",
            score: Math.max(0.5, score - 0.3),
            feedback: "Articulates performance vs complexity trade-offs.",
          },
          {
            criterionId: "edge_case_awareness",
            score: Math.max(0.5, score - 0.4),
            feedback: "Discussed recovery strategies for network and cache failures.",
          },
        ];

    return {
      explanation: `Candidate provided a ${
        score >= 3.0 ? "thorough and well-reasoned" : "surface-level"
      } response addressing fundamental principles.`,
      criteriaResults,
    };
  }

  if (task === "generate_follow_up") {
    return {
      prompt:
        "How would your design behave under a 10x traffic spike or network partition between data centers?",
      followUpType: "deepen",
      rationale:
        "Probes edge case handling and resilience under degraded infrastructure.",
    };
  }

  return {};
}
