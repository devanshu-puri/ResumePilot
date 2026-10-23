import { describe, it, expect } from "vitest";
import { getRubricTemplate, getRubricForQuestionType, RUBRIC_TEMPLATES } from "@/modules/interview/domain/rubrics";
import { aggregateScore } from "@/modules/interview/domain/score-aggregator";
import { AppError } from "@/shared/errors/app-error";

describe("Rubrics & Score Aggregation (INT-T2, INT-T3)", () => {
  describe("Rubric Templates (INT-T2)", () => {
    it("loads versioned rubric templates for all question types", () => {
      const defense = getRubricForQuestionType("resume_defense");
      expect(defense.id).toBe("resume_defense_v1");
      expect(defense.version).toBe("v1");
      expect(defense.criteria.length).toBe(4);

      const conceptual = getRubricForQuestionType("conceptual");
      expect(conceptual.id).toBe("conceptual_v1");
      expect(conceptual.criteria.length).toBe(3);

      const code = getRubricForQuestionType("code_explanation");
      expect(code.id).toBe("code_explanation_v1");
      expect(code.criteria.length).toBe(3);
    });

    it("ensures rubric templates are immutable", () => {
      const template = getRubricTemplate("resume_defense_v1");
      expect(template).toBe(RUBRIC_TEMPLATES["resume_defense_v1"]);
    });
  });

  describe("Score Aggregator & Bounds Validation (INT-T3, Invariant I-04)", () => {
    it("calculates exact totals and ratios deterministically in code", () => {
      const criteria = [
        { criterionId: "c1", score: 3.5, maxScore: 4.0 },
        { criterionId: "c2", score: 4.0, maxScore: 4.0 },
        { criterionId: "c3", score: 2.5, maxScore: 4.0 },
      ];

      const result = aggregateScore(criteria);
      expect(result.totalScore).toBe(10.0);
      expect(result.maxScore).toBe(12.0);
      expect(result.ratio).toBe(0.8333);
    });

    it("rejects negative scores", () => {
      const criteria = [{ criterionId: "c1", score: -0.5, maxScore: 4.0 }];
      expect(() => aggregateScore(criteria)).toThrow(AppError);
    });

    it("rejects scores exceeding maxScore", () => {
      const criteria = [{ criterionId: "c1", score: 4.5, maxScore: 4.0 }];
      expect(() => aggregateScore(criteria)).toThrow(AppError);
    });

    it("handles empty criterion list cleanly", () => {
      const result = aggregateScore([]);
      expect(result.totalScore).toBe(0);
      expect(result.ratio).toBe(0);
    });
  });
});
