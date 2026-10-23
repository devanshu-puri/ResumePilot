import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
