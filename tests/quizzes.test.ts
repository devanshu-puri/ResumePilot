import { describe, it, expect, beforeEach } from "vitest";
import { quizService } from "@/modules/library/services/quiz-service";
import { resumeService } from "@/modules/resume/services/resume-service";

describe("Resume-Based MCQ Quizzes & Flashcards Service", () => {
  const userId = "test_user_quiz_1";

  beforeEach(async () => {
    // Seed test resume for user
    await resumeService.processResume(userId, {
      text: `EXPERIENCE
AI Engineer — CasePilot
- Integrated Grok (LLM) to process user queries and generate context-aware legal responses
- Utilized Supabase for backend services including data storage and authentication

PROJECTS
AQI Data Visualization System
- Built a data visualization system using Python to analyze Air Quality Index (AQI) data
- Used Pandas and Matplotlib to clean, process, and visualize environmental data`,
    });
  });

  it("generates personalized quizzes categorized and grounded in user resume", async () => {
    const data = await quizService.getQuizzes(userId);

    expect(data.quizzes.length).toBeGreaterThan(0);
    expect(data.categories.length).toBeGreaterThan(0);

    const casepilotQuiz = data.quizzes.find((q) => q.topicSlug === "grok");
    expect(casepilotQuiz).toBeDefined();
    expect(casepilotQuiz?.isResumeGrounded).toBe(true);
    expect(casepilotQuiz?.questionCount).toBe(5);
    expect(casepilotQuiz?.category).toBe("Project-specific technical knowledge");
  });

  it("sanitizes questions on single quiz fetch to prevent client-side answer inspection", async () => {
    const data = await quizService.getQuizzes(userId);
    const quizId = data.quizzes[0].id;

    const quiz = await quizService.getQuiz(userId, quizId);
    expect(quiz.id).toBe(quizId);
    expect(quiz.questions.length).toBeGreaterThan(0);

    for (const q of quiz.questions) {
      expect(q.correctOptionId).toBe(""); // Obfuscated on client fetch
      expect(q.explanation).toBe(""); // Obfuscated on client fetch
      expect(q.options.length).toBe(4);
    }
  });

  it("evaluates quiz submission server-side and computes topic-wise breakdown", async () => {
    const data = await quizService.getQuizzes(userId);
    const quizId = data.quizzes[0].id;

    // Submit answers where question 1 is option 'a'
    const submission = {
      cp_1: "a",
      cp_2: "b",
      cp_3: "wrong_choice",
      cp_4: "a",
      cp_5: "b",
    };

    const result = await quizService.submitQuiz(userId, quizId, submission);

    expect(result.score).toBeGreaterThan(0);
    expect(result.maxScore).toBe(5);
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.topicBreakdown).toBeDefined();
    expect(result.questionsReview.length).toBe(5);

    // Verify detailed explanations are returned post-submission
    for (const rev of result.questionsReview) {
      expect(rev.explanation.length).toBeGreaterThan(5);
    }
  });

  it("provides personalized flashcard decks linked to quizzes", async () => {
    const decks = await quizService.getFlashcardDecks(userId);

    expect(decks.length).toBeGreaterThan(0);
    const grokDeck = decks.find((d) => d.topicSlug === "grok");
    expect(grokDeck).toBeDefined();
    expect(grokDeck?.cards.length).toBeGreaterThan(0);
    expect(grokDeck?.relatedQuizId).toBe("quiz_casepilot_grok");

    // Flashcards have front, back, and subtopic
    for (const card of grokDeck!.cards) {
      expect(card.front.length).toBeGreaterThan(10);
      expect(card.back.length).toBeGreaterThan(10);
      expect(card.subtopic.length).toBeGreaterThan(2);
    }
  });
});
