export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface RubricTemplate {
  id: string;
  version: string;
  questionType: "resume_defense" | "conceptual" | "code_explanation";
  title: string;
  criteria: RubricCriterion[];
}

export const RUBRIC_TEMPLATES: Record<string, RubricTemplate> = {
  "resume_defense_v1": {
    id: "resume_defense_v1",
    version: "v1",
    questionType: "resume_defense",
    title: "Resume Defense Rubric",
    criteria: [
      {
        id: "technical_accuracy",
        name: "Technical Accuracy & Soundness",
        description: "Accurately describes internal mechanics, APIs, and data structures of the claimed technology.",
        maxScore: 4.0,
      },
      {
        id: "personal_ownership",
        name: "Claim Grounding & Ownership",
        description: "Demonstrates authentic individual contribution without assuming facts outside the resume claim.",
        maxScore: 4.0,
      },
      {
        id: "tradeoff_justification",
        name: "Trade-off & Architectural Rationale",
        description: "Articulates why the specific architectural decision or technology choice was made over alternatives.",
        maxScore: 4.0,
      },
      {
        id: "edge_case_awareness",
        name: "Failure Modes & Edge Cases",
        description: "Addresses edge cases, performance bottlenecks, concurrency issues, or recovery strategies.",
        maxScore: 4.0,
      },
    ],
  },

  "conceptual_v1": {
    id: "conceptual_v1",
    version: "v1",
    questionType: "conceptual",
    title: "Conceptual Deep-Dive Rubric",
    criteria: [
      {
        id: "core_definition",
        name: "Fundamental Correctness",
        description: "Explains the foundational concept with clarity and precise domain terminology.",
        maxScore: 4.0,
      },
      {
        id: "mechanism_explanation",
        name: "Internal Mechanism & Flow",
        description: "Details how the system or algorithm works under the hood (memory, lifecycle, network).",
        maxScore: 4.0,
      },
      {
        id: "practical_application",
        name: "Practical Application & Trade-offs",
        description: "Connects concept to real-world software design, highlighting advantages and drawbacks.",
        maxScore: 4.0,
      },
    ],
  },

  "code_explanation_v1": {
    id: "code_explanation_v1",
    version: "v1",
    questionType: "code_explanation",
    title: "Code Review & Explanation Rubric",
    criteria: [
      {
        id: "code_correctness",
        name: "Logic Correctness & Semantics",
        description: "Understands syntactic and semantic execution logic (reviewed, not executed).",
        maxScore: 4.0,
      },
      {
        id: "complexity_analysis",
        name: "Time & Space Complexity",
        description: "Correctly identifies Big-O time and memory implications of the implementation.",
        maxScore: 4.0,
      },
      {
        id: "readability_maintainability",
        name: "Idiomatic Patterns & Maintainability",
        description: "Employs clean separation of concerns, error handling, and idiomatic idioms.",
        maxScore: 4.0,
      },
    ],
  },
};

export function getRubricTemplate(rubricId: string): RubricTemplate {
  const template = RUBRIC_TEMPLATES[rubricId];
  if (!template) {
    // Default fallback to conceptual
    return RUBRIC_TEMPLATES["conceptual_v1"];
  }
  return template;
}

export function getRubricForQuestionType(questionType: "resume_defense" | "conceptual" | "code_explanation"): RubricTemplate {
  switch (questionType) {
    case "resume_defense":
      return RUBRIC_TEMPLATES["resume_defense_v1"];
    case "code_explanation":
      return RUBRIC_TEMPLATES["code_explanation_v1"];
    case "conceptual":
    default:
      return RUBRIC_TEMPLATES["conceptual_v1"];
  }
}
