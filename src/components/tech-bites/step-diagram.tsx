"use client";

import React, { useState } from "react";
import { DiagramNode } from "@/content/tech-bites/lesson-schema";
import { ArrowRight, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

export interface StepDiagramProps {
  nodes: DiagramNode[];
  className?: string;
}

export function StepDiagram({ nodes, className }: StepDiagramProps) {
  const [activeNodeId, setActiveNodeId] = useState<string>(nodes[0]?.id || "");

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  return (
    <div className={clsx("rounded border border-line bg-card overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-wash/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-library animate-pulse" />
          <span className="text-xs font-mono font-medium text-ink uppercase tracking-wider">
            Interactive Mental Model Pipeline
          </span>
        </div>
        <span className="text-[11px] font-mono text-ink-4">
          Click any stage to inspect
        </span>
      </div>

      {/* Nodes Pipeline Carousel / Grid */}
      <div className="p-4 border-b border-line bg-paper/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {nodes.map((node, index) => {
            const isActive = node.id === activeNodeId;
            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  onClick={() => setActiveNodeId(node.id)}
                  className={clsx(
                    "flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all border",
                    isActive
                      ? "border-library bg-library-wash text-ink shadow-sm"
                      : "border-line bg-card hover:border-ink-2 text-ink-2"
                  )}
                >
                  <span
                    className={clsx(
                      "w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0",
                      isActive
                        ? "bg-library text-on-ink"
                        : "bg-wash text-ink-2"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-sans font-medium whitespace-nowrap">
                      {node.label}
                    </span>
                    {node.subtext && (
                      <span className="text-[10px] font-mono text-ink-4 whitespace-nowrap">
                        {node.subtext}
                      </span>
                    )}
                  </div>
                </button>

                {index < nodes.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-ink-4 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Card */}
      {activeNode && (
        <div className="p-4 bg-wash/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-library/10 text-library border border-library/30 font-medium">
              Stage Inspector: {activeNode.label}
            </span>
            {activeNode.subtext && (
              <span className="text-xs font-mono text-ink-4">
                • {activeNode.subtext}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-sans text-ink leading-relaxed">
            {activeNode.description}
          </p>
        </div>
      )}
    </div>
  );
}
