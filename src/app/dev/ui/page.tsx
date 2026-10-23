"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { CriterionRow } from "@/components/ui/criterion-row";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { GapMarker } from "@/components/ui/gap-marker";
import { Eyebrow, HeroEyebrowRule } from "@/components/ui/eyebrow";
import { SourceHighlight } from "@/components/ui/source-highlight";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FramedPanel } from "@/components/ui/framed-panel";
import { CodeBox } from "@/components/ui/code-box";
import { EmptyState } from "@/components/ui/empty-state";

export default function DevUiPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [segmentedVal, setSegmentedVal] = useState<"text" | "claims">("text");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 bg-canvas min-h-screen text-ink">
      {/* Header and Theme Switcher */}
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <Eyebrow module="neutral">ENTERPRISE DESIGN SYSTEM PRIMITIVES</Eyebrow>
          <h1 className="text-3xl font-serif font-normal text-ink mt-2">
            ResumePilot UI Workbench
          </h1>
          <HeroEyebrowRule className="my-3" />
          <p className="text-sm text-ink-2 font-sans mt-1">
            Oracle Warm Neutral Ladder, Dual Display Registers, and Zero-Shadow Elevation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={theme}
            onChange={(val) => setTheme(val as "light" | "dark")}
          />
        </div>
      </div>

      {/* Oracle Warm Neutral Ladder */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          1. Six-Rung Warm Neutral Ladder
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="border border-hairline p-3 rounded-xs bg-canvas">
            <div className="text-xs font-mono font-medium">canvas</div>
            <div className="text-[11px] text-ink-4">#FFFFFF</div>
          </div>
          <div className="border border-hairline p-3 rounded-xs bg-canvas-soft">
            <div className="text-xs font-mono font-medium">canvas-soft</div>
            <div className="text-[11px] text-ink-4">#FBF9F8</div>
          </div>
          <div className="border border-hairline p-3 rounded-xs bg-canvas-tint">
            <div className="text-xs font-mono font-medium">canvas-tint</div>
            <div className="text-[11px] text-ink-4">#F5F4F2</div>
          </div>
          <div className="border border-hairline p-3 rounded-xs bg-canvas-warm">
            <div className="text-xs font-mono font-medium">canvas-warm</div>
            <div className="text-[11px] text-ink-4">#F1EFED</div>
          </div>
          <div className="border border-hairline p-3 rounded-xs bg-hairline text-ink">
            <div className="text-xs font-mono font-medium">hairline</div>
            <div className="text-[11px] text-ink-4">#E4E1DD</div>
          </div>
          <div className="border border-hairline p-3 rounded-xs bg-ink-deep text-on-primary">
            <div className="text-xs font-mono font-medium">ink-deep</div>
            <div className="text-[11px] opacity-70">#211E1C</div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          2. Action Buttons (Charcoal #312D2A, 4px Radius)
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="ghost">Ghost Action</Button>
          <Button variant="danger">Delete Data</Button>
          <Button variant="primary" disabled>
            Disabled Button
          </Button>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">3. Badges</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="strong">Passed · Strong 3/4</Badge>
          <Badge variant="partial">Needs review · Partial 2/4</Badge>
          <Badge variant="weak">Open gap · Weak 1/4</Badge>
          <Badge variant="notscored">Not scored · Pending</Badge>
          <Badge variant="resume">Resume</Badge>
          <Badge variant="interview">Interview</Badge>
          <Badge variant="library">Library</Badge>
          <Badge variant="neutral">Informational</Badge>
        </div>
      </section>

      {/* Score Bars */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">4. ScoreBars</h2>
        <div className="space-y-3 max-w-md">
          <ScoreBar score={4} maxScore={4} />
          <ScoreBar score={3} maxScore={4} />
          <ScoreBar score={2} maxScore={4} />
          <ScoreBar score={1} maxScore={4} />
          <ScoreBar score={null} maxScore={4} />
        </div>
      </section>

      {/* Criterion Rows */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">5. Criterion Rows</h2>
        <div className="border border-hairline rounded-md p-4 bg-canvas">
          <CriterionRow
            criterionName="Technical Accuracy"
            score={3}
            maxScore={4}
            feedback="Explained Redis hash structures clearly, but omitted eviction policy implications."
            evidenceQuote="We used Redis hashes to cache user sessions for faster retrieval across services."
          />
          <CriterionRow
            criterionName="Trade-off Justification"
            score={1}
            maxScore={4}
            feedback="Did not explain why Redis was chosen over in-memory process cache or Memcached."
            evidenceQuote="We just picked Redis because everyone uses Redis."
          />
          <CriterionRow
            criterionName="Failure Recovery"
            score={null}
            maxScore={4}
            feedback="Evaluator was inconclusive on persistence strategy."
          />
        </div>
      </section>

      {/* Evidence Chips & Gap Markers */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          6. Evidence Chips & Gap Markers
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <EvidenceChip
            sourceType="Interview"
            topicName="Redis caching"
            ratio={0.4}
            href="#"
          />
          <EvidenceChip
            sourceType="Activity"
            topicName="Redis caching"
            ratio={0.85}
            href="#"
          />
          <EvidenceChip
            sourceType="Retest"
            topicName="Redis caching"
            ratio={0.75}
            href="#"
          />
          <GapMarker version="v1" />
        </div>
      </section>

      {/* Source Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          7. Source Highlight (Resume ↔ Claim in Georgia Serif)
        </h2>
        <div className="p-4 border border-hairline rounded-md bg-canvas space-y-2 text-sm leading-relaxed">
          <p>
            Architected and deployed a{" "}
            <SourceHighlight status="selected">
              microservice caching layer using Redis clusters
            </SourceHighlight>{" "}
            reducing database read latency by 45%.
          </p>
          <p>
            Implemented{" "}
            <SourceHighlight status="confirmed">
              JWT authentication with HTTP-only cookies
            </SourceHighlight>{" "}
            for secure session handling.
          </p>
          <p>
            Collaborated on{" "}
            <SourceHighlight status="unconfirmed">
              Kubernetes cluster monitoring using Prometheus
            </SourceHighlight>{" "}
            (pending user review).
          </p>
          <p>
            <SourceHighlight status="excluded">
              Assisted with legacy SVN to Git migration
            </SourceHighlight>{" "}
            (excluded from question set).
          </p>
        </div>
      </section>

      {/* Segmented Control */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          8. Segmented Control
        </h2>
        <div>
          <SegmentedControl
            options={[
              { value: "text", label: "Text View" },
              { value: "claims", label: "Claims & Topics" },
            ]}
            value={segmentedVal}
            onChange={(val) => setSegmentedVal(val as "text" | "claims")}
          />
        </div>
      </section>

      {/* Framed Panel */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          9. Framed Panel (Corner Ticks)
        </h2>
        <FramedPanel className="space-y-2">
          <Eyebrow module="interview">NEXT-BEST-ACTION</Eyebrow>
          <h3 className="text-xl font-serif font-normal text-ink mt-2">
            Retest Redis Caching Defense
          </h3>
          <p className="text-xs text-ink-2 font-sans">
            Recommended because your last interview defense scored 0.40, and you
            subsequently passed the Redis Caching Practice Activity with 0.85.
          </p>
          <div className="pt-2">
            <Button variant="primary">Start Retest Question</Button>
          </div>
        </FramedPanel>
      </section>

      {/* Chromatic Bands (Oracle Whole-Band Scale) */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">
          10. Chromatic Bands (Band Scale Only)
        </h2>
        <div className="space-y-3">
          <div className="p-6 bg-band-teal text-ink rounded-none border border-hairline">
            <div className="font-serif font-normal text-lg">Band Teal (#D6E5E5)</div>
            <div className="text-xs font-sans text-ink-2 mt-1">
              Pale strip used to separate neutral section runs without card chrome.
            </div>
          </div>
          <div className="p-6 bg-band-forest text-on-primary rounded-none">
            <div className="font-serif font-normal text-lg text-white">Band Forest (#33553C)</div>
            <div className="text-xs font-sans opacity-80 mt-1">
              Deep enterprise band carrying white text and corporate link columns.
            </div>
          </div>
        </div>
      </section>

      {/* Code Box */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">11. Code Box</h2>
        <CodeBox
          language="typescript"
          code={`async function getCache(key: string): Promise<string | null> {\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n  return null;\n}`}
        />
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-xl font-sans font-extrabold text-ink">12. Empty State</h2>
        <EmptyState
          title="No resume uploaded yet"
          description="Upload your resume in PDF, DOCX, or paste text to extract claims and generate interview questions."
          action={<Button variant="primary">Upload Resume</Button>}
        />
      </section>
    </div>
  );
}
