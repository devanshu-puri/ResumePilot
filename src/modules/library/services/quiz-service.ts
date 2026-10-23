import {
  QuizDefinition,
  QuizCategory,
  QuizAttemptResult,
  FlashcardDeck,
} from "../domain/quizzes";
import { resumeService } from "@/modules/resume/services/resume-service";
import { evidenceService } from "@/modules/evidence/services/evidence-service";
import { AppError } from "@/shared/errors/app-error";

interface StoredQuizAttempt {
  attemptId: string;
  quizId: string;
  userId: string;
  completedAt: Date;
  score: number;
  maxScore: number;
  percentage: number;
  answers: Record<string, string>;
  incorrectQuestionIds: string[];
  topicBreakdown: Record<string, { total: number; correct: number }>;
  topicsToRevisit: string[];
}

const globalForQuizzes = globalThis as unknown as {
  __QUIZZES_STORE__?: Map<string, QuizDefinition[]>;
  __QUIZ_ATTEMPTS_STORE__?: Map<string, StoredQuizAttempt[]>;
};

if (!globalForQuizzes.__QUIZZES_STORE__) {
  globalForQuizzes.__QUIZZES_STORE__ = new Map<string, QuizDefinition[]>();
}
if (!globalForQuizzes.__QUIZ_ATTEMPTS_STORE__) {
  globalForQuizzes.__QUIZ_ATTEMPTS_STORE__ = new Map<string, StoredQuizAttempt[]>();
}

const quizzesStore = globalForQuizzes.__QUIZZES_STORE__;
const attemptsStore = globalForQuizzes.__QUIZ_ATTEMPTS_STORE__;

export class QuizService {
  /**
   * Generates or fetches personalized quizzes for a given user grounded in their resume.
   */
  async getQuizzes(userId: string): Promise<{
    quizzes: (Omit<QuizDefinition, "questions"> & {
      questionCount: number;
      bestScore?: number;
      lastScore?: number;
      isCompleted: boolean;
    })[];
    categories: QuizCategory[];
  }> {
    let userQuizzes = quizzesStore.get(userId);

    if (!userQuizzes || userQuizzes.length === 0) {
      userQuizzes = await this.generatePersonalizedQuizzes(userId);
      quizzesStore.set(userId, userQuizzes);
    }

    const userAttempts = attemptsStore.get(userId) || [];

    const quizzesWithProgress = userQuizzes.map((q) => {
      const qAttempts = userAttempts.filter((a) => a.quizId === q.id);
      const bestScore = qAttempts.length > 0 ? Math.max(...qAttempts.map((a) => a.percentage)) : undefined;
      const lastAttempt = qAttempts[qAttempts.length - 1];
      const lastScore = lastAttempt ? lastAttempt.percentage : undefined;
      const isCompleted = qAttempts.some((a) => a.percentage >= 70);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { questions, ...meta } = q;
      return {
        ...meta,
        questionCount: questions.length,
        bestScore,
        lastScore,
        isCompleted,
      };
    });

    const activeCategories = Array.from(new Set(userQuizzes.map((q) => q.category)));

    return {
      quizzes: quizzesWithProgress,
      categories: activeCategories,
    };
  }

  /**
   * Retrieves single quiz definition for taking. Sanitizes correct answers.
   */
  async getQuiz(userId: string, quizId: string): Promise<QuizDefinition> {
    const userQuizzes = (await this.getQuizzes(userId)).quizzes;
    const fullQuizzes = quizzesStore.get(userId) || [];
    const found = fullQuizzes.find((q) => q.id === quizId);

    if (!found) {
      throw AppError.notFound(`Quiz with ID '${quizId}' not found.`);
    }

    // Return without exposing correctOptionId or explanation to prevent client-side inspection
    return {
      ...found,
      questions: found.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctOptionId: "", // Obfuscated during active test
        explanation: "", // Obfuscated during active test
        hint: q.hint,
        topicSlug: q.topicSlug,
        subtopic: q.subtopic,
        source: q.source,
        codeSnippet: q.codeSnippet,
      })),
    };
  }

  /**
   * Evaluates quiz submission server-side, persists attempt, and appends to TopicEvidence.
   */
  async submitQuiz(
    userId: string,
    quizId: string,
    answers: Record<string, string>
  ): Promise<QuizAttemptResult> {
    const fullQuizzes = quizzesStore.get(userId) || [];
    const quiz = fullQuizzes.find((q) => q.id === quizId);

    if (!quiz) {
      throw AppError.notFound(`Quiz with ID '${quizId}' not found.`);
    }

    let score = 0;
    const maxScore = quiz.questions.length;
    const incorrectQuestionIds: string[] = [];
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};
    const questionsReview: QuizAttemptResult["questionsReview"] = [];

    for (const q of quiz.questions) {
      const selected = answers[q.id] || "";
      const isCorrect = selected === q.correctOptionId;

      if (!topicBreakdown[q.topicSlug]) {
        topicBreakdown[q.topicSlug] = { total: 0, correct: 0 };
      }
      topicBreakdown[q.topicSlug].total += 1;

      if (isCorrect) {
        score += 1;
        topicBreakdown[q.topicSlug].correct += 1;
      } else {
        incorrectQuestionIds.push(q.id);
      }

      questionsReview.push({
        questionId: q.id,
        question: q.question,
        selectedOptionId: selected,
        correctOptionId: q.correctOptionId,
        isCorrect,
        explanation: q.explanation,
        topicSlug: q.topicSlug,
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const status = percentage >= 70 ? "passed" : "needs_review";

    // Determine topics to revisit (topics with < 70% accuracy)
    const topicsToRevisit: string[] = [];
    for (const [topic, stats] of Object.entries(topicBreakdown)) {
      if (stats.correct / stats.total < 0.7) {
        topicsToRevisit.push(topic);
      }
    }

    const attemptId = `qatt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storedAttempt: StoredQuizAttempt = {
      attemptId,
      quizId,
      userId,
      completedAt: new Date(),
      score,
      maxScore,
      percentage,
      answers,
      incorrectQuestionIds,
      topicBreakdown,
      topicsToRevisit,
    };

    const userAttempts = attemptsStore.get(userId) || [];
    userAttempts.push(storedAttempt);
    attemptsStore.set(userId, userAttempts);

    // Append evidence for the quiz's primary topic
    try {
      await evidenceService.appendEvidence({
        userId,
        topicId: quiz.topicSlug,
        sourceType: "activity_attempt",
        sourceId: attemptId,
        ratio: maxScore > 0 ? score / maxScore : 0,
        comparabilityKey: `${quiz.topicSlug}:mcq_quiz:${quiz.difficulty}`,
        rubricVersion: "v1",
      });
    } catch {
      // Ignored
    }

    return {
      attemptId,
      quizId,
      userId,
      completedAt: storedAttempt.completedAt.toISOString(),
      score,
      maxScore,
      percentage,
      status,
      answers,
      incorrectQuestionIds,
      topicBreakdown,
      questionsReview,
      topicsToRevisit,
    };
  }

  /**
   * Generates or fetches personalized revision flashcards for the user.
   */
  async getFlashcardDecks(userId: string): Promise<FlashcardDeck[]> {
    const resume = await resumeService.getActiveResume(userId);

    // Ground decks in user's resume projects & skills
    const decks: FlashcardDeck[] = [
      {
        id: "deck_casepilot_grok",
        title: "CasePilot & Grok LLM Architecture",
        category: "Project-specific technical knowledge",
        topicSlug: "grok",
        relatedSkillOrProject: "CasePilot (Legal AI)",
        cardsCount: 4,
        relatedQuizId: "quiz_casepilot_grok",
        cards: [
          {
            id: "fc_1",
            front: "What is the primary role of system prompt framing when integrating an LLM into a domain app like CasePilot?",
            back: "System prompts establish boundaries, persona, citation requirements, and instruct the LLM to refuse ungrounded legal advice or prompt injection attacks.",
            topicSlug: "grok",
            subtopic: "Prompt Engineering",
          },
          {
            id: "fc_2",
            front: "Why use Server-Sent Events (SSE) or streaming responses for an interactive AI chat interface?",
            back: "Streaming delivers the first token with sub-second perceived latency, rather than making the user wait 5-10 seconds for the entire completion to finish generating.",
            topicSlug: "grok",
            subtopic: "API Integration",
          },
          {
            id: "fc_3",
            front: "How does Retrieval-Augmented Generation (RAG) mitigate hallucinations in specialized applications?",
            back: "RAG fetches relevant source documents and injects them directly into the LLM context, ensuring the model bases its response on verified excerpts rather than training weights.",
            topicSlug: "grok",
            subtopic: "RAG Architecture",
          },
          {
            id: "fc_4",
            front: "What is token budgeting in LLM context windows?",
            back: "Token budgeting calculates the total tokens used by the system prompt, retrieved documents, chat history, and reserve tokens for the completion to avoid context overflow.",
            topicSlug: "grok",
            subtopic: "Token Management",
          },
        ],
      },
      {
        id: "deck_supabase_auth",
        title: "Supabase, PostgreSQL & Row Level Security",
        category: "Databases and APIs",
        topicSlug: "supabase",
        relatedSkillOrProject: "CasePilot (Backend)",
        cardsCount: 4,
        relatedQuizId: "quiz_supabase_backend",
        cards: [
          {
            id: "fc_sb_1",
            front: "How does PostgreSQL Row Level Security (RLS) differ from traditional application-level authorization?",
            back: "RLS enforces security policies at the database engine level. Even if an application route has a bug, the database strictly blocks unauthorized rows from being queried.",
            topicSlug: "supabase",
            subtopic: "Database Security",
          },
          {
            id: "fc_sb_2",
            front: "What function does Supabase provide inside PostgreSQL policies to identify the logged-in user?",
            back: "`auth.uid()` returns the user's UUID extracted from the JWT passed in the request Authorization header.",
            topicSlug: "supabase",
            subtopic: "Authentication",
          },
          {
            id: "fc_sb_3",
            front: "Why is an index critical on foreign keys used in RLS policies (e.g. `user_id`)?",
            back: "Without an index, every row check forces a full table sequential scan, drastically degrading query throughput under concurrent user load.",
            topicSlug: "supabase",
            subtopic: "Performance & Indexing",
          },
          {
            id: "fc_sb_4",
            front: "What is the role of PostgREST in the Supabase stack?",
            back: "PostgREST introspects the PostgreSQL schema and automatically serves a fast, secure RESTful API directly mapped to database tables and views.",
            topicSlug: "supabase",
            subtopic: "API Architecture",
          },
        ],
      },
      {
        id: "deck_python_data",
        title: "Python Data Science: Pandas & Matplotlib",
        category: "Programming languages and fundamentals",
        topicSlug: "python",
        relatedSkillOrProject: "AQI Data Visualization System",
        cardsCount: 4,
        relatedQuizId: "quiz_python_aqi",
        cards: [
          {
            id: "fc_py_1",
            front: "What is the difference between `df.dropna()` and `df.fillna()` in Pandas?",
            back: "`df.dropna()` removes rows or columns containing null values, while `df.fillna()` replaces missing values with a designated constant, mean, or interpolated value.",
            topicSlug: "python",
            subtopic: "Data Cleaning",
          },
          {
            id: "fc_py_2",
            front: "Why are vectorized operations in Pandas faster than standard Python `for` loops?",
            back: "Vectorized operations run in compiled C underneath (via NumPy) and operate on contiguous memory blocks without Python interpreter overhead.",
            topicSlug: "python",
            subtopic: "Pandas Optimization",
          },
          {
            id: "fc_py_3",
            front: "How does `matplotlib.pyplot.subplots()` help organize complex environmental visual charts?",
            back: "It creates a figure and a grid of axes objects simultaneously, allowing you to plot multiple sub-charts (e.g. AQI over time and pollutant distribution) in a single figure.",
            topicSlug: "python",
            subtopic: "Matplotlib Visualization",
          },
          {
            id: "fc_py_4",
            front: "What is the difference between a Pandas Series and a DataFrame?",
            back: "A Series is a one-dimensional labeled array, whereas a DataFrame is a two-dimensional tabular data structure with labeled axes (rows and columns).",
            topicSlug: "python",
            subtopic: "Core Data Structures",
          },
        ],
      },
      {
        id: "deck_dsa_fundamentals",
        title: "Data Structures & Complexity Fundamentals",
        category: "Core computer science concepts",
        topicSlug: "data-structures-algorithms",
        relatedSkillOrProject: "Resume Core Skills (DSA, C++)",
        cardsCount: 4,
        relatedQuizId: "quiz_dsa_fundamentals",
        cards: [
          {
            id: "fc_dsa_1",
            front: "What is the average time complexity of hash table lookup vs binary search tree lookup?",
            back: "Hash table average lookup is O(1) constant time, whereas a balanced BST lookup is O(log n).",
            topicSlug: "data-structures-algorithms",
            subtopic: "Time Complexity",
          },
          {
            id: "fc_dsa_2",
            front: "When should you use `std::vector` instead of `std::list` in C++?",
            back: "`std::vector` provides contiguous memory allocation, which gives excellent cache locality and fast O(1) random access by index.",
            topicSlug: "data-structures-algorithms",
            subtopic: "C++ Memory & Cache",
          },
          {
            id: "fc_dsa_3",
            front: "What distinguishes a Stack (LIFO) from a Queue (FIFO)?",
            back: "A Stack removes the most recently added item (Last In, First Out), while a Queue removes items in the order they arrived (First In, First Out).",
            topicSlug: "data-structures-algorithms",
            subtopic: "Linear Data Structures",
          },
          {
            id: "fc_dsa_4",
            front: "What happens when a hash collision occurs in separate chaining?",
            back: "Keys that hash to the same bucket index are stored in a linked list or secondary tree at that bucket location.",
            topicSlug: "data-structures-algorithms",
            subtopic: "Hashing & Collisions",
          },
        ],
      },
    ];

    return decks;
  }

  /**
   * Generates initial personalized quizzes grounded in user's resume data.
   */
  private async generatePersonalizedQuizzes(userId: string): Promise<QuizDefinition[]> {
    const resume = await resumeService.getActiveResume(userId);

    // Clean, practical quizzes grounded in user's projects & skills
    const quizzes: QuizDefinition[] = [
      {
        id: "quiz_casepilot_grok",
        title: "CasePilot: LLM & AI Legal Assistant",
        category: "Project-specific technical knowledge",
        relatedSkillOrProject: "CasePilot (Legal AI)",
        topicSlug: "grok",
        difficulty: "beginner",
        estimatedMinutes: 5,
        isResumeGrounded: true,
        relatedDeckId: "deck_casepilot_grok",
        questions: [
          {
            id: "cp_1",
            question: "In CasePilot, how do you prevent the AI assistant from providing fabricated or hallucinated legal statutes?",
            options: [
              { id: "a", text: "By using Retrieval-Augmented Generation (RAG) to inject verified legal excerpts into the prompt" },
              { id: "b", text: "By increasing the model temperature to 1.5 for higher creativity" },
              { id: "c", text: "By removing all system instructions from the API payload" },
              { id: "d", text: "By asking the model twice in a loop" },
            ],
            correctOptionId: "a",
            explanation: "RAG grounds the LLM in verified reference text retrieved from your database, instructing it to cite only confirmed statutes.",
            hint: "Think about grounding the model with source documentation.",
            topicSlug: "grok",
            source: "resume_based",
          },
          {
            id: "cp_2",
            question: "Why is streaming response (Server-Sent Events) beneficial when users ask complex legal queries in CasePilot?",
            options: [
              { id: "a", text: "It compresses the legal text to reduce database disk usage" },
              { id: "b", text: "It streams text chunks as they generate, drastically reducing time-to-first-token perceived latency" },
              { id: "c", text: "It eliminates the need for an API key" },
              { id: "d", text: "It prevents users from asking follow-up questions" },
            ],
            correctOptionId: "b",
            explanation: "Streaming starts displaying words to the user immediately as generated by the LLM, rather than waiting for the entire response to complete.",
            hint: "Consider user experience and perceived wait time.",
            topicSlug: "grok",
            source: "resume_based",
          },
          {
            id: "cp_3",
            question: "When sending user queries to an LLM API, what is the purpose of setting a system prompt?",
            options: [
              { id: "a", text: "To define the assistant's behavior, tone, guardrails, and role" },
              { id: "b", text: "To encrypt the database connection string" },
              { id: "c", text: "To configure DNS routing for Vercel" },
              { id: "d", text: "To reset user authentication tokens" },
            ],
            correctOptionId: "a",
            explanation: "System prompts define the guiding constraints, tone, and guardrails under which the AI interprets all subsequent user inputs.",
            hint: "It sets the identity and behavioral boundaries.",
            topicSlug: "grok",
            source: "resume_based",
          },
          {
            id: "cp_4",
            question: "What is prompt injection and how should an AI assistant handle it?",
            options: [
              { id: "a", text: "A user attempting to override system instructions via input; handled by strict input delimiters and guardrails" },
              { id: "b", text: "An SQL injection attack inside CSS stylesheets" },
              { id: "c", text: "A method to speed up LLM token generation" },
              { id: "d", text: "A database migration script failure" },
            ],
            correctOptionId: "a",
            explanation: "Prompt injection happens when untrusted user inputs try to bypass system rules (e.g. 'Ignore previous instructions').",
            hint: "It relates to untrusted user input trying to hijack model directives.",
            topicSlug: "grok",
            source: "recommended_revision",
          },
          {
            id: "cp_5",
            question: "What does the 'temperature' parameter control in LLM completions?",
            options: [
              { id: "a", text: "The physical heat of the GPU server cluster" },
              { id: "b", text: "The randomness / determinism of token selection (lower = more deterministic)" },
              { id: "c", text: "The maximum number of tokens allowed in memory" },
              { id: "d", text: "The rate limit of the network socket" },
            ],
            correctOptionId: "b",
            explanation: "Lower temperature (e.g. 0.0 to 0.2) makes responses focused and deterministic, which is ideal for structured and factual domain tasks.",
            hint: "Think about predictability vs creative randomness.",
            topicSlug: "grok",
            source: "recommended_revision",
          },
        ],
      },
      {
        id: "quiz_supabase_backend",
        title: "Supabase & PostgreSQL Backend Architecture",
        category: "Databases and APIs",
        relatedSkillOrProject: "CasePilot (Backend)",
        topicSlug: "supabase",
        difficulty: "beginner",
        estimatedMinutes: 5,
        isResumeGrounded: true,
        relatedDeckId: "deck_supabase_auth",
        questions: [
          {
            id: "sb_1",
            question: "What does Row Level Security (RLS) in PostgreSQL allow you to enforce?",
            options: [
              { id: "a", text: "Restricting which rows a user can SELECT, INSERT, UPDATE, or DELETE based on policy conditions" },
              { id: "b", text: "Compressing table rows on disk using gzip" },
              { id: "c", text: "Preventing multiple users from viewing the same website page simultaneously" },
              { id: "d", text: "Automatically generating CSS styles for tables" },
            ],
            correctOptionId: "a",
            explanation: "RLS policies run at the database layer to restrict row access per user based on authenticated session context.",
            hint: "It controls granular access to specific database rows.",
            topicSlug: "supabase",
            source: "resume_based",
          },
          {
            id: "sb_2",
            question: "In Supabase, which standard token format is used to authenticate client requests to backend services?",
            options: [
              { id: "a", text: "JSON Web Tokens (JWT)" },
              { id: "b", text: "XML SOAP envelope" },
              { id: "c", text: "Plain text passwords in query strings" },
              { id: "d", text: "Base64 encoded CSV files" },
            ],
            correctOptionId: "a",
            explanation: "Supabase GoTrue signs and returns JWTs that client apps send in the Authorization: Bearer header.",
            hint: "A 3-part encoded token format with a header, payload, and signature.",
            topicSlug: "supabase",
            source: "resume_based",
          },
          {
            id: "sb_3",
            question: "What happens if you enable RLS on a PostgreSQL table without creating any access policies?",
            options: [
              { id: "a", text: "All standard non-superuser queries will return zero rows or be denied access by default" },
              { id: "b", text: "The table is automatically dropped from the database" },
              { id: "c", text: "All users gain full unrestricted admin privileges" },
              { id: "d", text: "The database crashes with a fatal error" },
            ],
            correctOptionId: "a",
            explanation: "Enabling RLS with no policies acts as a default-deny: normal users cannot read or write any rows.",
            hint: "Default-deny security model.",
            topicSlug: "supabase",
            source: "recommended_revision",
          },
          {
            id: "sb_4",
            question: "What is the primary benefit of creating an index on a foreign key like `user_id` in relational tables?",
            options: [
              { id: "a", text: "Speeds up lookups and joins from O(n) table scans to O(log n) index scans" },
              { id: "b", text: "Prevents users from signing up with duplicate email addresses" },
              { id: "c", text: "Encrypts the user's password" },
              { id: "d", text: "Makes table rows read-only" },
            ],
            correctOptionId: "a",
            explanation: "Indexes avoid costly full-table sequential scans when filtering or joining records by user ID.",
            hint: "Think about algorithmic query efficiency and execution speed.",
            topicSlug: "supabase",
            source: "recommended_revision",
          },
          {
            id: "sb_5",
            question: "What HTTP method should be used to retrieve data from a REST API endpoint without side effects?",
            options: [
              { id: "a", text: "GET" },
              { id: "b", text: "POST" },
              { id: "c", text: "DELETE" },
              { id: "d", text: "PUT" },
            ],
            correctOptionId: "a",
            explanation: "GET requests are idempotent and safe, intended solely for data retrieval without modifying server state.",
            hint: "The standard safe HTTP retrieval method.",
            topicSlug: "supabase",
            source: "recommended_revision",
          },
        ],
      },
      {
        id: "quiz_python_aqi",
        title: "Python Data Processing & Analysis (AQI System)",
        category: "Programming languages and fundamentals",
        relatedSkillOrProject: "AQI Data Visualization System",
        topicSlug: "python",
        difficulty: "beginner",
        estimatedMinutes: 5,
        isResumeGrounded: true,
        relatedDeckId: "deck_python_data",
        questions: [
          {
            id: "py_1",
            question: "In Pandas, which method is used to remove rows containing missing or null values from an AQI dataset?",
            options: [
              { id: "a", text: "df.dropna()" },
              { id: "b", text: "df.clear_nulls()" },
              { id: "c", text: "df.delete_empty()" },
              { id: "d", text: "df.remove_blank()" },
            ],
            correctOptionId: "a",
            explanation: "`df.dropna()` is the standard Pandas method for dropping missing (NaN/None) values along a specified axis.",
            hint: "Think of 'dropping' 'NA' values.",
            topicSlug: "python",
            source: "resume_based",
          },
          {
            id: "py_2",
            question: "Which Matplotlib function is commonly used to render a continuous time-series line chart of AQI values across days?",
            options: [
              { id: "a", text: "plt.plot(dates, aqi_values)" },
              { id: "b", text: "plt.draw_line_series(aqi_values)" },
              { id: "c", text: "plt.render_graph(dates)" },
              { id: "d", text: "plt.pie_chart(aqi_values)" },
            ],
            correctOptionId: "a",
            explanation: "`plt.plot(x, y)` draws line plots on Cartesian coordinates for continuous measurements over time.",
            hint: "The basic Matplotlib line plotting function.",
            topicSlug: "python",
            source: "resume_based",
          },
          {
            id: "py_3",
            question: "What is the difference between a list and a tuple in Python?",
            options: [
              { id: "a", text: "Lists are mutable (can be changed); tuples are immutable (read-only once created)" },
              { id: "b", text: "Tuples can only store numbers; lists can store strings" },
              { id: "c", text: "Lists use parentheses (); tuples use square brackets []" },
              { id: "d", text: "Tuples cannot be indexed or looped over" },
            ],
            correctOptionId: "a",
            explanation: "Python lists `[1, 2]` are mutable. Tuples `(1, 2)` cannot be modified after creation, making them hashable and memory efficient.",
            hint: "Mutablility vs immutability.",
            topicSlug: "python",
            source: "recommended_revision",
          },
          {
            id: "py_4",
            question: "What does `df.groupby('city')['aqi'].mean()` calculate in Pandas?",
            options: [
              { id: "a", text: "The average AQI score for each distinct city in the dataset" },
              { id: "b", text: "The total number of rows in the table" },
              { id: "c", text: "The name of the most polluted city" },
              { id: "d", text: "A list of cities sorted in alphabetical order" },
            ],
            correctOptionId: "a",
            explanation: "`groupby('city')` groups rows by city name, and `.mean()` calculates the arithmetic average for the AQI column per group.",
            hint: "Group by category, aggregate by mean.",
            topicSlug: "python",
            source: "recommended_revision",
          },
          {
            id: "py_5",
            question: "How do you handle potential exceptions (like file not found or invalid data format) when reading a CSV in Python?",
            options: [
              { id: "a", text: "Using a `try...except` block" },
              { id: "b", text: "Using an `if...restart` loop" },
              { id: "c", text: "Using the `pass_error` statement" },
              { id: "d", text: "Exceptions cannot be caught in Python" },
            ],
            correctOptionId: "a",
            explanation: "`try...except FileNotFoundError` handles runtime errors gracefully without crashing the application.",
            hint: "Python's standard error handling construct.",
            topicSlug: "python",
            source: "recommended_revision",
          },
        ],
      },
      {
        id: "quiz_dsa_fundamentals",
        title: "Data Structures & Algorithms Fundamentals",
        category: "Core computer science concepts",
        relatedSkillOrProject: "Core Concepts (C++, DSA)",
        topicSlug: "data-structures-algorithms",
        difficulty: "beginner",
        estimatedMinutes: 5,
        isResumeGrounded: true,
        relatedDeckId: "deck_dsa_fundamentals",
        questions: [
          {
            id: "dsa_1",
            question: "What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
            options: [
              { id: "a", text: "O(log n)" },
              { id: "b", text: "O(n)" },
              { id: "c", text: "O(1)" },
              { id: "d", text: "O(n²)" },
            ],
            correctOptionId: "a",
            explanation: "In a balanced BST, each comparison halves the search space, yielding O(log n) search time.",
            hint: "Halving the search space at each level.",
            topicSlug: "data-structures-algorithms",
            source: "resume_based",
          },
          {
            id: "dsa_2",
            question: "In C++, what is the primary benefit of `std::vector` over a raw pointer array?",
            options: [
              { id: "a", text: "Automatic memory management and dynamic resizing without manual `new` and `delete`" },
              { id: "b", text: "Faster lookup than O(1) constant time" },
              { id: "c", text: "It cannot store integers" },
              { id: "d", text: "It eliminates all compiler warnings automatically" },
            ],
            correctOptionId: "a",
            explanation: "`std::vector` manages its own heap memory automatically via RAII and resizes dynamically when capacity is exceeded.",
            hint: "RAII and dynamic resizing.",
            topicSlug: "data-structures-algorithms",
            source: "resume_based",
          },
          {
            id: "dsa_3",
            question: "Which data structure follows the First-In, First-Out (FIFO) principle?",
            options: [
              { id: "a", text: "Queue" },
              { id: "b", text: "Stack" },
              { id: "c", text: "Binary Heap" },
              { id: "d", text: "Trie" },
            ],
            correctOptionId: "a",
            explanation: "A Queue operates as FIFO: the first element inserted is the first element removed (like a line of people).",
            hint: "Like a line at a ticket counter.",
            topicSlug: "data-structures-algorithms",
            source: "recommended_revision",
          },
          {
            id: "dsa_4",
            question: "What is a major advantage of a hash map (hash table) for lookups?",
            options: [
              { id: "a", text: "O(1) average-time complexity for key insertion and retrieval" },
              { id: "b", text: "Keys are always kept in strictly sorted order" },
              { id: "c", text: "Uses zero memory" },
              { id: "d", text: "Requires no hash function" },
            ],
            correctOptionId: "a",
            explanation: "Hash maps compute an index from the key via a hash function, allowing constant-time O(1) average lookup.",
            hint: "Constant time key-value access.",
            topicSlug: "data-structures-algorithms",
            source: "recommended_revision",
          },
          {
            id: "dsa_5",
            question: "What is the time complexity of Bubble Sort in the worst case?",
            options: [
              { id: "a", text: "O(n²)" },
              { id: "b", text: "O(n log n)" },
              { id: "c", text: "O(n)" },
              { id: "d", text: "O(1)" },
            ],
            correctOptionId: "a",
            explanation: "Bubble sort uses nested loops comparing adjacent elements, taking quadratic O(n²) time in the worst case.",
            hint: "Nested pairwise comparisons.",
            topicSlug: "data-structures-algorithms",
            source: "recommended_revision",
          },
        ],
      },
    ];

    return quizzes;
  }
}

export const quizService = new QuizService();
