import { describe, it, expect } from "vitest";
import { locateQuote } from "@/modules/resume/domain/locate-quote";

describe("locateQuote (RES-T3)", () => {
  const resumeSample = `
EDUCATION
B.S. Computer Science, 2024

EXPERIENCE
Software Engineering Intern, Acme Corp
- Architected and deployed a microservice caching layer using Redis clusters, reducing DB latency by 45%.
- Implemented JWT authentication with HTTP-only cookies for secure session handling.
- Implemented JWT authentication with HTTP-only cookies across internal microservices.

PROJECTS
Personal Portfolio: Built with Next.js, React, and Tailwind CSS.
`;

  it("finds exact matches correctly", () => {
    const quote = "Architected and deployed a microservice caching layer using Redis clusters, reducing DB latency by 45%.";
    const result = locateQuote(resumeSample, quote);

    expect(result).not.toBeNull();
    if (result) {
      expect(resumeSample.slice(result.startOffset, result.endOffset)).toBe(quote);
    }
  });

  it("matches across irregular whitespace and line breaks", () => {
    // Quote with single space where raw text has different whitespace
    const rawWithBreaks = "Deployed a microservice\n\n  caching layer  using Redis clusters.";
    const proposedQuote = "Deployed a microservice caching layer using Redis clusters.";

    const result = locateQuote(rawWithBreaks, proposedQuote);
    expect(result).not.toBeNull();
    if (result) {
      expect(rawWithBreaks.slice(result.startOffset, result.endOffset)).toBe(rawWithBreaks);
    }
  });

  it("handles repeated quotes by finding first unused occurrence after startSearchFromOffset", () => {
    const repeatedQuote = "Implemented JWT authentication with HTTP-only cookies";

    // First occurrence
    const firstResult = locateQuote(resumeSample, repeatedQuote);
    expect(firstResult).not.toBeNull();

    // Second occurrence (searching from end of first)
    if (firstResult) {
      const secondResult = locateQuote(resumeSample, repeatedQuote, firstResult.endOffset);
      expect(secondResult).not.toBeNull();
      if (secondResult) {
        expect(secondResult.startOffset).toBeGreaterThan(firstResult.endOffset);
      }
    }
  });

  it("returns null when quote does not exist in text (never hallucinates offsets)", () => {
    const hallucinatedQuote = "Led a team of 50 developers to migrate AWS to Azure in 2 weeks.";
    const result = locateQuote(resumeSample, hallucinatedQuote);
    expect(result).toBeNull();
  });

  it("returns null for empty or whitespace-only inputs", () => {
    expect(locateQuote(resumeSample, "")).toBeNull();
    expect(locateQuote(resumeSample, "   \n ")).toBeNull();
    expect(locateQuote("", "some quote")).toBeNull();
  });
});
