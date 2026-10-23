import React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileX } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Eyebrow module="neutral">ACCOUNT & RETENTION</Eyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-ink mt-2">
          Account Settings
        </h1>
        <p className="text-sm text-ink-2 font-sans mt-1">
          Manage your data, export records, and configure privacy options.
        </p>
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
