"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FramedPanel } from "@/components/ui/framed-panel";
import { SourceHighlight } from "@/components/ui/source-highlight";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Upload,
  Check,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";

interface Claim {
  id: string;
  claimType: string;
  claimText: string;
  quoteText: string;
  sourceStartOffset: number;
  sourceEndOffset: number;
  userConfirmed: boolean;
  excluded: boolean;
  topics?: { slug: string; name: string; isCanonical: boolean }[];
}

interface ResumeData {
  id: string;
  status: string;
  rawText: string;
  claims: Claim[];
  topics: { slug: string; name: string; isCanonical: boolean }[];
  discardedClaimsCount: number;
}

const DEFAULT_DEMO_RESUME = `EDUCATION
B.S. in Computer Science — Graduated May 2024

EXPERIENCE
Software Engineering Intern — CloudScale Systems (June 2023 – Dec 2023)
- Architected and deployed a microservice caching layer using Redis clusters, reducing DB read latency by 45%.
- Implemented JWT authentication with HTTP-only cookies and role-based access control (RBAC).
- Designed and benchmarked PostgreSQL database indexes on high-cardinality multi-tenant tables.

PROJECTS
Distributed Event Broker (Go, Kafka, Docker)
- Built a fault-tolerant message streaming pipeline handling 5,000 events/sec with at-least-once delivery semantics.
- Containerized development environments using Docker and orchestrated multi-service integration tests.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Go, SQL
Technologies: React, Node.js, Redis, PostgreSQL, Docker, Git`;

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"both" | "claims" | "text">("both");
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editClaimText, setEditClaimText] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [pasteInput, setPasteInput] = useState(DEFAULT_DEMO_RESUME);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch active resume
  const fetchActiveResume = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        if (data.resume) {
          setResume(data.resume);
          if (data.resume.claims?.length > 0) {
            setSelectedClaimId(data.resume.claims[0].id);
          }
        }
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchActiveResume();
  }, []);

  // File Upload Handler (PDF, DOCX, TXT)
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process resume file.");
      }

      // Fetch newly created resume
      const detailRes = await fetch(`/api/resumes/${data.resumeId}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        setResume(detailData.resume);
        if (detailData.resume.claims?.length > 0) {
          setSelectedClaimId(detailData.resume.claims[0].id);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Text Upload handler
  const handleUploadText = async (textToUpload: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToUpload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process resume");
      }

      // Fetch newly created resume
      const detailRes = await fetch(`/api/resumes/${data.resumeId}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        setResume(detailData.resume);
        if (detailData.resume.claims?.length > 0) {
          setSelectedClaimId(detailData.resume.claims[0].id);
        }
      }
      setShowPasteModal(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Confirm All Claims
  const handleConfirmAll = async () => {
    if (!resume) return;
    setLoading(true);
    try {
      for (const claim of resume.claims) {
        if (!claim.userConfirmed && !claim.excluded) {
          await fetch(`/api/resumes/${resume.id}/claims/${claim.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userConfirmed: true, excluded: false }),
          });
        }
      }
      const detailRes = await fetch(`/api/resumes/${resume.id}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        setResume(detailData.resume);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  // Toggle Confirm Claim
  const handleToggleConfirm = async (claimId: string, currentVal: boolean) => {
    if (!resume) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userConfirmed: !currentVal, excluded: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      }
    } catch {
      // Ignore
    }
  };

  // Toggle Exclude Claim
  const handleToggleExclude = async (claimId: string, currentVal: boolean) => {
    if (!resume) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excluded: !currentVal, userConfirmed: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      }
    } catch {
      // Ignore
    }
  };

  // Edit claim text save
  const handleSaveClaimEdit = async (claimId: string) => {
    if (!resume) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimText: editClaimText }),
      });
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
        setEditingClaimId(null);
      }
    } catch {
      // Ignore
    }
  };

  // Delete resume
  const handleDeleteResume = async () => {
    if (!resume) return;
    try {
      await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
      setResume(null);
      setSelectedClaimId(null);
    } catch {
      // Ignore
    }
  };

  const confirmedClaims = resume?.claims.filter((c) => c.userConfirmed && !c.excluded) || [];
  const selectedClaim = resume?.claims.find((c) => c.id === selectedClaimId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Eyebrow module="resume">MODULE 01 · RESUME INTELLIGENCE</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
            Resume & Claim Workspace
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 font-sans mt-0.5">
            Exact source offsets, confirmed claims, and canonical topic links.
          </p>
        </div>

        {resume && (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteResume}
              title="Delete active resume (cascade purge)"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Delete Resume</span>
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 border border-weak rounded bg-weak-wash text-weak text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* No Resume State */}
      {!resume && (
        <div className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-line hover:border-ink-2 bg-card"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-wash flex items-center justify-center mx-auto mb-4 border border-line">
              <Upload className={`w-7 h-7 ${loading ? "animate-bounce text-primary" : "text-ink-2"}`} />
            </div>

            <h2 className="text-xl font-display font-medium text-ink">
              {loading ? "Extracting Verifiable Claims..." : "Upload Your Technical Resume"}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2 max-w-md mx-auto mt-2 leading-relaxed">
              Upload a <strong>PDF</strong>, <strong>DOCX</strong>, or <strong>TXT</strong> document (max 5 MB).
              Your resume is processed in-memory and ephemeral—never written to disk.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button
                variant="primary"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                <span>{loading ? "Analyzing Document..." : "Browse Document (PDF, DOCX, TXT)"}</span>
              </Button>

              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => setShowPasteModal(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>Paste Plain Text</span>
              </Button>

              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => handleUploadText(DEFAULT_DEMO_RESUME)}
                title="Instantly test with pre-built engineer resume"
              >
                <Sparkles className="w-4 h-4 mr-2 text-warning" />
                <span>Load Sample Tech Resume</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Modal / Drawer */}
      {showPasteModal && !resume && (
        <div className="border border-line rounded p-5 bg-card space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-ink">Paste Resume Content</h3>
            <button
              onClick={() => setShowPasteModal(false)}
              className="text-ink-4 hover:text-ink text-xs font-mono"
            >
              Cancel
            </button>
          </div>

          <textarea
            rows={12}
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            className="w-full p-3 font-mono text-xs border border-line rounded bg-paper text-ink focus:outline-none focus:border-ink"
            placeholder="Paste raw resume text here..."
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="primary"
              disabled={loading || pasteInput.trim().length === 0}
              onClick={() => handleUploadText(pasteInput)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{loading ? "Analyzing Claims..." : "Run Claim Extraction"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Active Resume Workspace */}
      {resume && (
        <div className="space-y-6">
          {/* Top Control Bar: Role Selection & Creation status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded border border-line bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-2">
                Target Role:
              </span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="px-3 py-1.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Backend Software Engineer">Backend Software Engineer</option>
                <option value="Distributed Systems Engineer">Distributed Systems Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-sans text-right">
                <span className="font-medium text-ink">{confirmedClaims.length}</span>{" "}
                <span className="text-ink-2">of {resume.claims.length} claims confirmed</span>
                {confirmedClaims.length === 0 && (
                  <p className="text-[11px] text-partial font-medium">
                    (Confirm ≥1 claim to create question set)
                  </p>
                )}
              </div>

              {confirmedClaims.length < resume.claims.length && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={handleConfirmAll}
                  title="Confirm all extracted claims for defense practice"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Confirm All</span>
                </Button>
              )}

              <Button
                variant="primary"
                disabled={confirmedClaims.length === 0}
                onClick={() => {
                  window.location.href = `/interview?targetRole=${encodeURIComponent(targetRole)}`;
                }}
              >
                <span>Create Question Set</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Module II: Quick Launch into Interactive Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/drills"
              className="p-4 rounded border border-interview/30 bg-interview-wash/20 hover:border-interview hover:bg-interview-wash/30 transition-all flex items-center justify-between group no-underline"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="interview">MODULE II</Badge>
                  <span className="text-xs font-mono font-medium text-ink">Skill Drills Runner</span>
                </div>
                <p className="text-xs text-ink-2 mt-1">
                  Targeted technical drill questions tailored to your parsed tech stack.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-interview transform group-hover:translate-x-0.5 transition-transform ml-3 flex-shrink-0" />
            </Link>

            <Link
              href="/projects"
              className="p-4 rounded border border-interview/30 bg-interview-wash/20 hover:border-interview hover:bg-interview-wash/30 transition-all flex items-center justify-between group no-underline"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="interview">MODULE II</Badge>
                  <span className="text-xs font-mono font-medium text-ink">Project Defense Panel</span>
                </div>
                <p className="text-xs text-ink-2 mt-1">
                  Senior mock defense grounded in your resume projects & metrics.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-interview transform group-hover:translate-x-0.5 transition-transform ml-3 flex-shrink-0" />
            </Link>
          </div>

          {/* Main 2-Column Review Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Claims List & Detail */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-medium text-base text-ink">
                  Extracted Claims ({resume.claims.length})
                </h3>
                {resume.discardedClaimsCount > 0 && (
                  <span className="text-[11px] font-mono text-ink-4">
                    {resume.discardedClaimsCount} unverified quotes discarded
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {resume.claims.map((claim) => {
                  const isSelected = claim.id === selectedClaimId;
                  const isEditing = claim.id === editingClaimId;

                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`p-4 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-resume bg-resume-wash/20"
                          : "border-line bg-card hover:border-ink-2"
                      } ${claim.excluded ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-line bg-wash text-ink-2">
                            {claim.claimType.replace(/_/g, " ")}
                          </span>
                          {claim.userConfirmed && (
                            <Badge variant="strong">Confirmed</Badge>
                          )}
                          {claim.excluded && (
                            <span className="text-[10px] font-mono text-ink-4 line-through">
                              Excluded
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleConfirm(claim.id, claim.userConfirmed);
                            }}
                            className={`p-1 rounded text-xs transition-colors ${
                              claim.userConfirmed
                                ? "bg-strong-wash text-strong"
                                : "text-ink-4 hover:text-ink"
                            }`}
                            title="Confirm claim"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExclude(claim.id, claim.excluded);
                            }}
                            className={`p-1 rounded text-xs transition-colors ${
                              claim.excluded
                                ? "bg-weak-wash text-weak"
                                : "text-ink-4 hover:text-ink"
                            }`}
                            title="Exclude from practice"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingClaimId(claim.id);
                              setEditClaimText(claim.claimText);
                            }}
                            className="p-1 rounded text-xs text-ink-4 hover:text-ink"
                            title="Edit interpretation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Claim Text Interpretation */}
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editClaimText}
                            onChange={(e) => setEditClaimText(e.target.value)}
                            className="w-full p-2 text-xs font-sans border border-line rounded bg-paper"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClaimId(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveClaimEdit(claim.id);
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs sm:text-sm font-sans text-ink leading-relaxed">
                          {claim.claimText}
                        </p>
                      )}

                      {/* Source Quote snippet */}
                      <div className="mt-2.5 pt-2 border-t border-line/50">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-4 block mb-0.5">
                          Exact Source Quote
                        </span>
                        <p className="text-xs font-book italic text-resume">
                          &ldquo;{claim.quoteText}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Source Document View & Topics */}
            <div className="lg:col-span-6 space-y-6">
              {/* Topics Summary */}
              <div className="p-4 rounded border border-line bg-card space-y-3">
                <Eyebrow module="library">RECOGNIZED TOPICS</Eyebrow>
                <div className="flex flex-wrap gap-2 pt-1">
                  {resume.topics.map((t) => (
                    <Badge
                      key={t.slug}
                      variant={t.isCanonical ? "library" : "partial"}
                    >
                      {t.name} {!t.isCanonical && "(candidate)"}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Source Text View with Highlight */}
              <div className="border border-line rounded bg-paper overflow-hidden">
                <div className="px-4 py-2 bg-wash-2/40 border-b border-line flex items-center justify-between text-xs font-mono text-ink-2">
                  <span>RESUME SOURCE TEXT</span>
                  <span className="text-[10px] text-ink-4">
                    {selectedClaim ? `Highlighting offsets ${selectedClaim.sourceStartOffset}–${selectedClaim.sourceEndOffset}` : "Click a claim to inspect source"}
                  </span>
                </div>

                <div className="p-4 font-book text-xs leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-text">
                  {selectedClaim ? (
                    <>
                      <span>{resume.rawText.slice(0, selectedClaim.sourceStartOffset)}</span>
                      <SourceHighlight status="selected">
                        {resume.rawText.slice(
                          selectedClaim.sourceStartOffset,
                          selectedClaim.sourceEndOffset
                        )}
                      </SourceHighlight>
                      <span>{resume.rawText.slice(selectedClaim.sourceEndOffset)}</span>
                    </>
                  ) : (
                    <span>{resume.rawText}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
