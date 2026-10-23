import {
  LessonCompletionPayload,
  LessonCompletionResult,
} from "@/content/tech-bites/lesson-schema";
import { getLessonById } from "@/content/tech-bites/lessons";

/**
 * In-memory / local progress cache for deterministic offline & standalone operation
 */
const completedLessonsCache = new Map<string, { completedAt: string; passed: boolean }>();
const bookmarkedLessonsCache = new Set<string>();
let accumulatedXp = 0;

/**
 * Evaluates lesson completion and recall assessment deterministically.
 * XP is awarded when lesson is completed AND active recall question is passed.
 */
export async function completeLessonSession(params: {
  userId?: string;
  payload: LessonCompletionPayload;
}): Promise<LessonCompletionResult> {
  const { payload } = params;
  const { lessonId, recallAnswerId, bookmarked } = payload;

  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Lesson not found: ${lessonId}`);
  }

  const recallStep = lesson.steps[4];
  if (!recallStep || !recallStep.interactiveExercise) {
    throw new Error(`Recall step missing in lesson: ${lessonId}`);
  }

  // 1. Deterministic evaluation of recall question
  const recallPassed =
    recallAnswerId.trim() ===
    recallStep.interactiveExercise.correctOptionId.trim();

  let xpAwarded = 0;

  // 2. Award XP and record completion only if recall passed
  if (recallPassed) {
    xpAwarded = lesson.xpAward ?? 50;
    accumulatedXp += xpAwarded;

    completedLessonsCache.set(lessonId, {
      completedAt: new Date().toISOString(),
      passed: true,
    });
  }

  // 3. Handle bookmarking
  if (bookmarked) {
    bookmarkedLessonsCache.add(lessonId);
  } else {
    bookmarkedLessonsCache.delete(lessonId);
  }

  return {
    lessonId,
    recallPassed,
    xpAwarded,
    totalXp: accumulatedXp,
    completedAt: new Date().toISOString(),
    bookmarked: bookmarkedLessonsCache.has(lessonId),
    feedback: recallPassed
      ? `Mental model verified! You mastered "${lesson.title}" and earned +${xpAwarded} XP.`
      : recallStep.interactiveExercise.explanation,
  };
}

export function isLessonCompleted(lessonId: string): boolean {
  return completedLessonsCache.has(lessonId);
}

export function isLessonBookmarked(lessonId: string): boolean {
  return bookmarkedLessonsCache.has(lessonId);
}

export function getUserTotalXp(): number {
  return accumulatedXp;
}
