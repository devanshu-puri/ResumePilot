import { AppError } from "@/shared/errors/app-error";

export type SessionStatus = "draft" | "in_progress" | "paused" | "completed" | "abandoned";

export interface SessionState {
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
}

export type SessionAction =
  | { type: "START" }
  | { type: "NEXT_QUESTION" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "COMPLETE" }
  | { type: "ABANDON" };

/**
 * Pure state machine transition function (INT-T4).
 * Rejects illegal transitions and preserves position on pause/resume.
 */
export function transitionSession(
  state: SessionState,
  action: SessionAction,
  now = new Date()
): SessionState {
  switch (action.type) {
    case "START": {
      if (state.status !== "draft") {
        throw AppError.validation(`Cannot start a session that is already in status: ${state.status}`);
      }
      return {
        ...state,
        status: "in_progress",
        currentQuestionIndex: 0,
        startedAt: now,
      };
    }

    case "NEXT_QUESTION": {
      if (state.status !== "in_progress") {
        throw AppError.validation(`Cannot advance question in status: ${state.status}`);
      }
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.totalQuestions) {
        // Automatically transition to completed if finished last question
        return {
          ...state,
          status: "completed",
          completedAt: now,
        };
      }
      return {
        ...state,
        currentQuestionIndex: nextIndex,
      };
    }

    case "PAUSE": {
      if (state.status !== "in_progress") {
        throw AppError.validation(`Can only pause an in_progress session, current: ${state.status}`);
      }
      return {
        ...state,
        status: "paused",
        pausedAt: now,
      };
    }

    case "RESUME": {
      if (state.status !== "paused") {
        throw AppError.validation(`Can only resume a paused session, current: ${state.status}`);
      }
      return {
        ...state,
        status: "in_progress",
        pausedAt: undefined,
      };
    }

    case "COMPLETE": {
      if (state.status !== "in_progress" && state.status !== "paused") {
        throw AppError.validation(`Cannot complete session from status: ${state.status}`);
      }
      return {
        ...state,
        status: "completed",
        completedAt: now,
      };
    }

    case "ABANDON": {
      if (state.status === "completed") {
        throw AppError.validation("Cannot abandon an already completed session");
      }
      return {
        ...state,
        status: "abandoned",
      };
    }

    default:
      throw AppError.validation(`Unknown action: ${(action as { type: string }).type}`);
  }
}
