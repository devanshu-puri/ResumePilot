import { DerivedGap } from "./gap-rules";

export interface NextBestActionOutput {
  actionType: "resume_session" | "review_claims" | "practise_gap" | "retest_topic" | "start_defense" | "upload_resume";
  title: string;
  description: string;
  because: string;
  href: string;
  module: "resume" | "interview" | "library" | "neutral";
  buttonLabel: string;
}

export interface UserWorkspaceState {
  hasResume: boolean;
  unreviewedClaimsCount: number;
  confirmedClaimsCount: number;
  activeSessionId?: string;
  activeSessionStatus?: string;
  openGaps: DerivedGap[];
}

/**
 * Pure deterministic Next-Best-Action engine (EVD-T7, blueprint §4).
 * Always cites real record links in the 'because' line (Invariant I-01).
 */
export function computeNextBestAction(state: UserWorkspaceState): NextBestActionOutput {
  // 1. Resume active session in progress
  if (state.activeSessionId && state.activeSessionStatus === "in_progress") {
    return {
      actionType: "resume_session",
      title: "Resume In-Progress Interview Session",
      description: "You have an active technical interview practice session waiting for your answer.",
      because: `Because session #${state.activeSessionId} is currently in_progress.`,
      href: `/interview?sessionId=${state.activeSessionId}`,
      module: "interview",
      buttonLabel: "Resume Session",
    };
  }

  // 2. Unreviewed resume claims
  if (state.hasResume && state.unreviewedClaimsCount > 0) {
    return {
      actionType: "review_claims",
      title: "Confirm Extracted Resume Claims",
      description: "Review your claims and verify exact source quotes to ground your interview defense.",
      because: `Because you have ${state.unreviewedClaimsCount} pending unreviewed claims from your uploaded resume.`,
      href: "/resume",
      module: "resume",
      buttonLabel: "Review Claims",
    };
  }

  // 3. Retest eligible for a gap that was practiced
  const retestGap = state.openGaps.find((g) => g.retestEligible);
  if (retestGap) {
    return {
      actionType: "retest_topic",
      title: `Retest ${retestGap.topicId.replace(/-/g, " ")} Defense`,
      description: "You completed a practice activity following a prior low score. Take a comparable retest question to measure improvement.",
      because: `Because you passed a practice activity for '${retestGap.topicId}' after an open gap was detected.`,
      href: `/interview?retestTopic=${retestGap.topicId}`,
      module: "interview",
      buttonLabel: "Start Retest Question",
    };
  }

  // 4. Open gap with matched activity
  if (state.openGaps.length > 0) {
    const gap = state.openGaps[0];
    const avgScore = (gap.latestRatios.reduce((a, b) => a + b, 0) / gap.latestRatios.length).toFixed(2);
    return {
      actionType: "practise_gap",
      title: `Address Evidenced Gap in ${gap.topicId.replace(/-/g, " ")}`,
      description: "Your interview responses evidenced low technical accuracy on this topic. Complete a structured practice activity to improve.",
      because: `Because your latest 2 interview evaluations averaged a score ratio of ${avgScore} (rule ${gap.gapRuleVersion}).`,
      href: `/library?topicSlug=${gap.topicId}`,
      module: "library",
      buttonLabel: "Open Practice Activity",
    };
  }

  // 5. Confirmed claims ready for defense
  if (state.hasResume && state.confirmedClaimsCount > 0) {
    return {
      actionType: "start_defense",
      title: "Start Resume Defense Session",
      description: "Your claims are confirmed. Test your ability to defend your technical decisions under interview scrutiny.",
      because: `Because you have ${state.confirmedClaimsCount} confirmed claims ready for defense questioning.`,
      href: "/interview",
      module: "interview",
      buttonLabel: "Start Practice Defense",
    };
  }

  // 6. Cold start (no resume uploaded)
  return {
    actionType: "upload_resume",
    title: "Upload Your Resume to Begin",
    description: "Upload a PDF, DOCX, or paste text to extract verifiable technical claims and generate defense questions.",
    because: "Because no active resume has been uploaded to your workspace yet.",
    href: "/resume",
    module: "resume",
    buttonLabel: "Upload Resume",
  };
}
