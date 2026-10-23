import { describe, it, expect } from "vitest";
import {
  validateResumeUpload,
  assessReadability,
  extractResumeText,
  MAX_RESUME_SIZE_BYTES,
} from "@/modules/resume/services/resume-extractor";

describe("Resume Validation & Text Extraction (RES-T2)", () => {
  it("rejects empty files", () => {
    const emptyBuffer = Buffer.alloc(0);
    const result = validateResumeUpload(emptyBuffer, "application/pdf", "resume.pdf");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("empty");
    }
  });

  it("rejects oversize files (> 5 MB)", () => {
    const oversizeBuffer = Buffer.alloc(MAX_RESUME_SIZE_BYTES + 1024);
    const result = validateResumeUpload(oversizeBuffer, "application/pdf", "resume.pdf");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("exceeds the 5 MB limit");
    }
  });

  it("rejects invalid/corrupt PDF magic bytes", () => {
    const corruptBuffer = Buffer.from("NOT_A_REAL_PDF_HEADER_DATA");
    const result = validateResumeUpload(corruptBuffer, "application/pdf", "resume.pdf");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Invalid PDF format");
    }
  });

  it("accepts valid PDF header signature", () => {
    const validPdfBuffer = Buffer.from("%PDF-1.7\nSome PDF content stream...");
    const result = validateResumeUpload(validPdfBuffer, "application/pdf", "resume.pdf");
    expect(result.valid).toBe(true);
  });

  it("accepts valid plain text and markdown", () => {
    const textBuffer = Buffer.from("Software Engineer with 4 years React experience.");
    const result = validateResumeUpload(textBuffer, "text/plain", "resume.txt");
    expect(result.valid).toBe(true);
  });

  it("identifies scanned-like or sparse documents and flags as failed_unreadable", () => {
    // 50KB file with almost no extractable text
    const scannedSparse = assessReadability("Scan 1", 50 * 1024);
    expect(scannedSparse.status).toBe("failed_unreadable");
    expect(scannedSparse.isScannedLike).toBe(true);
  });

  it("identifies corrupt or garbled binary text and flags as failed_unreadable", () => {
    const garbledText = "%%%%$$$$####@@@@!!!!~~~~````^^^^&&&&****";
    const result = assessReadability(garbledText, 1024);
    expect(result.status).toBe("failed_unreadable");
  });

  it("extracts clean readable text successfully", async () => {
    const resume = `
John Doe
Software Engineer
Experience:
- Built Redis caching layer handling 10,000 req/s.
- Deployed React application on AWS ECS.
`;
    const buffer = Buffer.from(resume, "utf-8");
    const result = await extractResumeText(buffer, "text/plain", "resume.txt");

    expect(result.status).toBe("extracted");
    expect(result.rawText).toContain("Built Redis caching layer");
  });
});
