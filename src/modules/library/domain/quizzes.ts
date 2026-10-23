export type QuizCategory =
  | "Programming languages and fundamentals"
  | "Frameworks and libraries"
  | "Databases and APIs"
  | "Core computer science concepts"
  | "Development tools and technologies"
  | "Project-specific technical knowledge"
  | "System design and architecture"
  | "Interview-focused technical fundamentals";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  hint?: string;
  topicSlug: string;
  subtopic?: string;
  source: "resume_based" | "recommended_revision";
  codeSnippet?: string;
}

export interface QuizDefinition {
  id: string;
  title: string;
  category: QuizCategory;
  relatedSkillOrProject: string;
  topicSlug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  questions: QuizQuestion[];
  isResumeGrounded: boolean;
  relatedDeckId?: string;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  userId: string;
  completedAt: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "passed" | "needs_review";
  answers: Record<string, string>; // questionId -> selectedOptionId
  incorrectQuestionIds: string[];
  topicBreakdown: Record<string, { total: number; correct: number }>;
  questionsReview: {
    questionId: string;
    question: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
    topicSlug: string;
  }[];
  topicsToRevisit: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topicSlug: string;
  subtopic: string;
  relatedQuizId?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  category: QuizCategory;
  topicSlug: string;
  relatedSkillOrProject: string;
  cardsCount: number;
  cards: Flashcard[];
  relatedQuizId: string;
}
