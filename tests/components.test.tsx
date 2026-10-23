import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { CriterionRow } from "@/components/ui/criterion-row";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { GapMarker } from "@/components/ui/gap-marker";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SourceHighlight } from "@/components/ui/source-highlight";
import { SegmentedControl } from "@/components/ui/segmented-control";

describe("DESIGN.md Component Primitives", () => {
  it("renders buttons with different variants and handles disabled state", () => {
    const { rerender } = render(<Button variant="primary">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDefined();

    rerender(<Button variant="primary" disabled>Disabled Action</Button>);
    const disabledBtn = screen.getByRole("button", { name: "Disabled Action" });
    expect(disabledBtn.hasAttribute("disabled")).toBe(true);
  });

  it("renders Badges with correct text and icons", () => {
    render(
      <div>
        <Badge variant="strong">Passed</Badge>
        <Badge variant="partial">Needs review</Badge>
        <Badge variant="weak">Open gap</Badge>
        <Badge variant="notscored">Pending</Badge>
      </div>
    );

    expect(screen.getByText("Passed")).toBeDefined();
    expect(screen.getByText("Needs review")).toBeDefined();
    expect(screen.getByText("Open gap")).toBeDefined();
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders ScoreBar with ratio bands and hatched un-scored state", () => {
    const { rerender } = render(<ScoreBar score={3} maxScore={4} />);
    expect(screen.getByText("3 / 4")).toBeDefined();

    rerender(<ScoreBar score={null} maxScore={4} />);
    expect(screen.getByText("Not scored")).toBeDefined();
  });

  it("renders CriterionRow and toggles evidence quote disclosure", () => {
    render(
      <CriterionRow
        criterionName="Redis Eviction"
        score={3}
        maxScore={4}
        feedback="Good explanation of LRU policy."
        evidenceQuote="We set maxmemory-policy to allkeys-lru in production."
      />
    );

    expect(screen.getByText("Redis Eviction")).toBeDefined();
    expect(screen.getByText("Good explanation of LRU policy.")).toBeDefined();

    // Disclosure button
    const toggleButton = screen.getByRole("button", { name: "Expand evidence quote" });
    expect(toggleButton).toBeDefined();

    // Initially quote is hidden
    expect(screen.queryByText(/We set maxmemory-policy/i)).toBeNull();

    // Click to open
    fireEvent.click(toggleButton);
    expect(screen.getByText(/We set maxmemory-policy/i)).toBeDefined();
  });

  it("renders EvidenceChip with proper ratio formatting", () => {
    render(
      <EvidenceChip
        sourceType="Interview"
        topicName="PostgreSQL Indexing"
        ratio={0.85}
      />
    );

    expect(screen.getByText("Interview")).toBeDefined();
    expect(screen.getByText("PostgreSQL Indexing")).toBeDefined();
    expect(screen.getByText("0.85")).toBeDefined();
  });

  it("renders GapMarker with version tooltip", () => {
    render(<GapMarker version="v1" />);
    expect(screen.getByText("Open gap")).toBeDefined();
    expect(screen.getByText("v1")).toBeDefined();
  });

  it("renders Eyebrow with module style", () => {
    render(<Eyebrow module="resume">RESUME REVIEW</Eyebrow>);
    expect(screen.getByText("RESUME REVIEW")).toBeDefined();
  });

  it("renders SourceHighlight correctly for selected and excluded states", () => {
    render(
      <div>
        <SourceHighlight status="selected">Selected quote</SourceHighlight>
        <SourceHighlight status="excluded">Excluded quote</SourceHighlight>
      </div>
    );

    expect(screen.getByText("Selected quote")).toBeDefined();
    expect(screen.getByText("Excluded quote")).toBeDefined();
  });

  it("handles SegmentedControl switching", () => {
    let current = "text";
    const handleChange = (val: string) => {
      current = val;
    };

    render(
      <SegmentedControl
        options={[
          { value: "text", label: "Text" },
          { value: "claims", label: "Claims" },
        ]}
        value={current}
        onChange={handleChange}
      />
    );

    const claimsTab = screen.getByRole("tab", { name: "Claims" });
    fireEvent.click(claimsTab);
    expect(current).toBe("claims");
  });
});
