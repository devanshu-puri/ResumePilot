"use client";

import React, { useState, useEffect } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, FileX, Key, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [isConfigured, setIsConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/ai-config")
      .then((r) => r.json())
      .then((data) => {
        setIsConfigured(data.configured);
        if (data.model) setModel(data.model);
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setFeedback({ type: "error", msg: "Please enter your Gemini API Key." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiApiKey: apiKey.trim(),
          geminiModel: model,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsConfigured(true);
        setFeedback({
          type: "success",
          msg: "Google Gemini AI successfully activated! You can now run live AI question defense and rubric evaluations.",
        });
        setApiKey("");
      } else {
        setFeedback({ type: "error", msg: data.error || "Failed to save API key." });
      }
    } catch (err) {
      setFeedback({ type: "error", msg: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Eyebrow module="neutral">ACCOUNT & RETENTION</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Settings & AI Configuration
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Connect your Google AI Studio key, manage data retention, and export records.
        </p>
      </div>

      {/* AI Provider Configuration Section */}
      <div className="border border-line rounded p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display font-medium text-base text-ink">
              Google Gemini Live AI Integration
            </h2>
          </div>
          <Badge variant={isConfigured ? "strong" : "weak"}>
            {isConfigured ? "AI Connected" : "Not Configured"}
          </Badge>
        </div>

        <p className="text-xs text-ink-2 font-sans leading-relaxed">
          Provide your Google AI Studio API Key to enable live, unscripted technical interview
          question generation, deep claim extraction from your resume, and multi-criterion rubric evaluations.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded border text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "border-strong bg-strong-wash text-strong"
                : "border-weak bg-weak-wash text-weak"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-mono uppercase text-ink-2 mb-1.5">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 text-xs font-sans border border-line rounded bg-paper text-ink focus:outline-none"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, Recommended for Interviews)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Architectural Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink-2 mb-1.5">
              Google AI Studio API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={isConfigured ? "••••••••••••••••••••••••••••••••" : "Paste your AIzaSy... API key here"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 p-2.5 text-xs font-mono border border-line rounded bg-paper text-ink focus:outline-none"
              />
              <Button
                variant="primary"
                disabled={saving || apiKey.trim().length === 0}
                onClick={handleSaveApiKey}
              >
                <Key className="w-3.5 h-3.5 mr-1.5" />
                <span>{saving ? "Saving..." : "Save Key"}</span>
              </Button>
            </div>
            <p className="text-[11px] text-ink-4 mt-1 font-sans">
              Get your free key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline hover:text-ink"
              >
                Google AI Studio
              </a>
              . Your key is stored securely in your local environment.
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="border border-line rounded p-5 bg-card space-y-3">
        <h2 className="font-display font-medium text-base text-ink">
          Export My Data (JSON)
        </h2>
        <p className="text-xs text-ink-2 font-sans">
          Download a complete archive of your profile, confirmed resume claims, interview
          evaluations, and topic evidence logs.
        </p>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          <span>Export Archive</span>
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="border border-line rounded p-5 bg-card space-y-6">
        <div>
          <h2 className="font-display font-medium text-base text-weak">
            Danger Zone
          </h2>
          <p className="text-xs text-ink-2 font-sans mt-0.5">
            Destructive actions cannot be reversed.
          </p>
        </div>

        <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-ink">Delete Active Resume</h3>
            <p className="text-xs text-ink-2">
              Removes your uploaded resume and all associated claims.
            </p>
          </div>
          <Button variant="danger" size="sm">
            <FileX className="w-3.5 h-3.5 mr-1.5" />
            <span>Delete Resume</span>
          </Button>
        </div>

        <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-ink">Delete All Account Data</h3>
            <p className="text-xs text-ink-2">
              Permanently purges your account, evidence ledger, attempts, and progress.
            </p>
          </div>
          <Button variant="danger" size="sm">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Delete All Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
