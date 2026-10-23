import { describe, it, expect } from "vitest";
import {
  getAllLessons,
  getLessonById,
  getLessonsByPath,
  validateLessonIntegrity,
} from "@/content/tech-bites/lessons";
import { completeLessonSession } from "@/modules/tech-bites/services/lesson-service";
import { LessonSchema } from "@/content/tech-bites/lesson-schema";

describe("Module 03 — Tech Bites (Learn in 15 Minutes)", () => {
  it("loads curated lessons conforming to the Zod LessonSchema", () => {
    const lessons = getAllLessons();
    expect(lessons.length).toBeGreaterThanOrEqual(2);

    for (const lesson of lessons) {
      const parsed = LessonSchema.safeParse(lesson);
      expect(parsed.success).toBe(true);
    }
  });

  it("enforces strict 5-stage sequential progression (Why -> Model -> See It -> Try It -> Recall)", () => {
    const lessons = getAllLessons();
    const expectedStages = ["why", "mental_model", "see_it", "try_it", "recall"];

    for (const lesson of lessons) {
      const integrity = validateLessonIntegrity(lesson);
      expect(integrity.valid, integrity.errors.join("; ")).toBe(true);
      expect(lesson.steps.length).toBe(5);

      lesson.steps.forEach((step, idx) => {
        expect(step.stage).toBe(expectedStages[idx]);
        expect(step.stageNumber).toBe(idx + 1);
        expect(step.durationMinutes).toBeGreaterThan(0);
      });
    }
  });

  it("filters lessons accurately by career path", () => {
    const backendLessons = getLessonsByPath("backend");
    expect(backendLessons.length).toBeGreaterThan(0);
    expect(backendLessons.every((l) => l.paths.includes("backend"))).toBe(true);

    const aiLessons = getLessonsByPath("ai");
    expect(aiLessons.length).toBeGreaterThan(0);
    expect(aiLessons.every((l) => l.paths.includes("ai"))).toBe(true);
  });

  it("evaluates active recall deterministically and awards XP on correct answer", async () => {
    const lesson = getLessonById("caching-fundamentals");
    expect(lesson).toBeDefined();
    if (!lesson) return;

    const recallStep = lesson.steps[4];
    const correctOptionId = recallStep.interactiveExercise!.correctOptionId;

    // Test correct answer
    const passResult = await completeLessonSession({
      payload: {
        lessonId: lesson.id,
        recallAnswerId: correctOptionId,
        durationMs: 900000,
        bookmarked: true,
      },
    });

    expect(passResult.recallPassed).toBe(true);
    expect(passResult.xpAwarded).toBe(lesson.xpAward ?? 50);
    expect(passResult.bookmarked).toBe(true);
    expect(passResult.feedback).toContain("Mental model verified");

    // Test incorrect answer
    const failResult = await completeLessonSession({
      payload: {
        lessonId: lesson.id,
        recallAnswerId: "wrong-option-id-xyz",
        durationMs: 900000,
        bookmarked: false,
      },
    });

    expect(failResult.recallPassed).toBe(false);
    expect(failResult.xpAwarded).toBe(0);
    expect(failResult.bookmarked).toBe(false);
  });
});
