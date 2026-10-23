import { describe, it, expect } from "vitest";
import { DrillQuestionSchema } from "@/content/drills/drill-schema";
import {
  ALL_DRILL_QUESTIONS,
  getQuestionsBySkills,
  getAvailableSkills,
} from "@/content/drills/drill-data";
import {
  ProjectQuestionSchema,
  ParsedProjectSchema,
} from "@/content/projects/project-panel-schema";
import { DEFAULT_SAMPLE_PROJECT } from "@/content/projects/sample-project-data";
import { generateProjectQuestions } from "@/content/projects/project-question-generator";

describe("Module II — Skill Drills & Project Interview Panel", () => {
  describe("Feature A: Skill Drills Question Bank & Schemas", () => {
    it("contains at least 15 verified drill questions", () => {
      expect(ALL_DRILL_QUESTIONS.length).toBeGreaterThanOrEqual(15);
    });

    it("ensures every drill question strictly conforms to DrillQuestionSchema", () => {
      for (const question of ALL_DRILL_QUESTIONS) {
        const result = DrillQuestionSchema.safeParse(question);
        expect(
          result.success,
          `Question ${question.id} failed validation: ${!result.success ? JSON.stringify(result.error.issues) : ""}`
        ).toBe(true);
      }
    });

    it("verifies that correctOptionId exists within the question options", () => {
      for (const question of ALL_DRILL_QUESTIONS) {
        const optionIds = question.options.map((o) => o.id);
        expect(optionIds).toContain(question.correctOptionId);
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(question.options.length).toBeLessThanOrEqual(4);
      }
    });

    it("provides complete 5-part feedback metadata (why, distractors, takeaway)", () => {
      for (const question of ALL_DRILL_QUESTIONS) {
        expect(question.explanation.why.length).toBeGreaterThan(10);
        expect(question.explanation.takeaway.length).toBeGreaterThan(10);
        expect(typeof question.explanation.distractors).toBe("object");
        // Verify distractors are documented for wrong options
        const wrongOptionIds = question.options
          .filter((o) => o.id !== question.correctOptionId)
          .map((o) => o.id);

        for (const wrongId of wrongOptionIds) {
          expect(question.explanation.distractors[wrongId]).toBeDefined();
        }
      }
    });

    it("filters drill questions accurately by candidate skills", () => {
      const skills = getAvailableSkills();
      expect(skills).toContain("TypeScript");
      expect(skills).toContain("React");
      expect(skills).toContain("PostgreSQL");
      expect(skills).toContain("Redis");
      expect(skills).toContain("System Design");

      const tsQuestions = getQuestionsBySkills(["TypeScript"]);
      expect(tsQuestions.length).toBeGreaterThan(0);
      expect(tsQuestions.every((q) => q.skillId.toLowerCase() === "typescript")).toBe(true);

      const mixedQuestions = getQuestionsBySkills(["React", "Redis"], "medium", 10);
      expect(mixedQuestions.length).toBeGreaterThan(0);
      expect(mixedQuestions.length).toBeLessThanOrEqual(10);
      expect(mixedQuestions.every((q) => ["react", "redis"].includes(q.skillId.toLowerCase()))).toBe(true);
    });
  });

  describe("Feature B: Project Interview Panel & Question Generator", () => {
    it("validates the default sample project against ParsedProjectSchema", () => {
      const parsed = ParsedProjectSchema.safeParse(DEFAULT_SAMPLE_PROJECT);
      expect(parsed.success).toBe(true);
      expect(DEFAULT_SAMPLE_PROJECT.techStack.length).toBeGreaterThan(0);
      expect(DEFAULT_SAMPLE_PROJECT.metrics).toBeDefined();
    });

    it("deterministically generates exactly 10 senior defense questions for a project", () => {
      const questions = generateProjectQuestions(DEFAULT_SAMPLE_PROJECT);
      expect(questions.length).toBe(10);

      // Verify each generated question satisfies ProjectQuestionSchema
      for (const q of questions) {
        const parsed = ProjectQuestionSchema.safeParse(q);
        expect(
          parsed.success,
          `Generated question ${q.id} failed validation: ${!parsed.success ? JSON.stringify(parsed.error.issues) : ""}`
        ).toBe(true);
      }
    });

    it("covers the 6 senior defense categories across generated questions", () => {
      const questions = generateProjectQuestions(DEFAULT_SAMPLE_PROJECT);
      const categories = new Set(questions.map((q) => q.category));

      expect(categories.has("Architecture & System Design")).toBe(true);
      expect(categories.has("Scale & Performance")).toBe(true);
      expect(categories.has("Failure Modes & Edge Cases")).toBe(true);
      expect(categories.has("Trade-offs & Alternatives")).toBe(true);
      expect(categories.has("Data Modeling & Storage")).toBe(true);
      expect(categories.has("Concurrency & Race Conditions")).toBe(true);
    });

    it("structures model answers in STAR format and includes follow-ups", () => {
      const questions = generateProjectQuestions(DEFAULT_SAMPLE_PROJECT);
      for (const q of questions) {
        // STAR format check
        expect(q.modelAnswer).toContain("**Situation:**");
        expect(q.modelAnswer).toContain("**Task:**");
        expect(q.modelAnswer).toContain("**Action:**");
        expect(q.modelAnswer).toContain("**Result:**");

        // Key points, traps, and follow-ups
        expect(q.keyPoints.length).toBeGreaterThanOrEqual(3);
        expect(q.commonMistakes.length).toBeGreaterThanOrEqual(2);
        expect(q.followUps.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("grounds generated questions in custom project tech stack and metrics", () => {
      const customProject = {
        id: "proj_custom",
        name: "Real-Time Telemetry Pipeline",
        role: "Data Infrastructure Lead",
        summary: "Ingested IoT streaming data at 50,000 events/second using Kafka and ClickHouse.",
        techStack: ["Kafka", "ClickHouse", "Go", "Kubernetes"],
        metrics: ["⚡ 50,000 events/sec", "⏱️ <100ms latency"],
        responsibilities: [
          "Engineered stream partition sharding strategy",
          "Managed dead-letter queues and schema evolutions",
        ],
      };

      const questions = generateProjectQuestions(customProject);
      expect(questions.length).toBe(10);

      // Verify that custom project metrics or tech stack are referenced
      const combinedText = questions.map((q) => q.question + " " + q.modelAnswer).join(" ");
      expect(
        combinedText.includes("Kafka") ||
          combinedText.includes("ClickHouse") ||
          combinedText.includes("50,000 events/sec")
      ).toBe(true);
    });
  });
});
