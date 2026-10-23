import { describe, it, expect } from "vitest";
import { transitionSession, SessionState } from "@/modules/interview/domain/session-state-machine";
import { AppError } from "@/shared/errors/app-error";

describe("Session State Machine (INT-T4)", () => {
  const initialDraftState: SessionState = {
    status: "draft",
    currentQuestionIndex: 0,
    totalQuestions: 3,
  };

  it("transitions from draft to in_progress upon START", () => {
    const next = transitionSession(initialDraftState, { type: "START" });
    expect(next.status).toBe("in_progress");
    expect(next.currentQuestionIndex).toBe(0);
    expect(next.startedAt).toBeDefined();
  });

  it("preserves question index through PAUSE and RESUME", () => {
    let state = transitionSession(initialDraftState, { type: "START" });
    state = transitionSession(state, { type: "NEXT_QUESTION" });
    expect(state.currentQuestionIndex).toBe(1);

    // Pause
    const paused = transitionSession(state, { type: "PAUSE" });
    expect(paused.status).toBe("paused");
    expect(paused.currentQuestionIndex).toBe(1);
    expect(paused.pausedAt).toBeDefined();

    // Resume
    const resumed = transitionSession(paused, { type: "RESUME" });
    expect(resumed.status).toBe("in_progress");
    expect(resumed.currentQuestionIndex).toBe(1);
    expect(resumed.pausedAt).toBeUndefined();
  });

  it("transitions to completed after advancing past the final question", () => {
    let state = transitionSession(initialDraftState, { type: "START" });
    state = transitionSession(state, { type: "NEXT_QUESTION" }); // index 1
    state = transitionSession(state, { type: "NEXT_QUESTION" }); // index 2
    state = transitionSession(state, { type: "NEXT_QUESTION" }); // reaches 3 (total 3)

    expect(state.status).toBe("completed");
    expect(state.completedAt).toBeDefined();
  });

  it("rejects illegal transitions", () => {
    // Cannot pause a draft session
    expect(() => transitionSession(initialDraftState, { type: "PAUSE" })).toThrow(AppError);

    // Cannot resume an in_progress session
    const running = transitionSession(initialDraftState, { type: "START" });
    expect(() => transitionSession(running, { type: "RESUME" })).toThrow(AppError);

    // Cannot abandon a completed session
    const completed: SessionState = { ...running, status: "completed" };
    expect(() => transitionSession(completed, { type: "ABANDON" })).toThrow(AppError);
  });
});
