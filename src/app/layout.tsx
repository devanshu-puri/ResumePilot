import type { Metadata } from "next";
import "./globals.css";
import { AmbientBackground } from "@/components/ui/ambient-background";

export const metadata: Metadata = {
  title: "ResumePilot — Know what your resume invites an interviewer to ask",
  description: "Practise defending your resume. Fix what you cannot yet explain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink relative antialiased selection:bg-accent-indigo selection:text-white">
        <AmbientBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
