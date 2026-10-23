import { AppError } from "@/shared/errors/app-error";

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (PRD RES-1)

export interface ExtractionResult {
  status: "extracted" | "failed_unreadable" | "failed_error";
  rawText?: string;
  errorMessage?: string;
  isScannedLike?: boolean;
}

/**
 * Validates file type, size, and magic bytes (RES-T2).
 */
export function validateResumeUpload(
  buffer: Buffer,
  mimeType: string,
  filename: string
): { valid: true } | { valid: false; reason: string; errorCode: "BAD_REQUEST" | "UNREADABLE_RESUME" } {
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      reason: "Uploaded file is empty.",
      errorCode: "BAD_REQUEST",
    };
  }

  if (buffer.length > MAX_RESUME_SIZE_BYTES) {
    return {
      valid: false,
      reason: `File size exceeds the 5 MB limit (received ${(buffer.length / 1024 / 1024).toFixed(1)} MB).`,
      errorCode: "BAD_REQUEST",
    };
  }

  const lowerName = filename.toLowerCase();

  // PDF Validation
  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    const header = buffer.subarray(0, 5).toString("ascii");
    if (!header.startsWith("%PDF-")) {
      return {
        valid: false,
        reason: "Invalid PDF format: file header signature is corrupt or missing.",
        errorCode: "BAD_REQUEST",
      };
    }
    return { valid: true };
  }

  // DOCX Validation (Zip magic bytes PK\x03\x04)
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const isZip =
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04;

    if (!isZip) {
      return {
        valid: false,
        reason: "Invalid DOCX format: file signature is corrupt or not a valid document archive.",
        errorCode: "BAD_REQUEST",
      };
    }
    return { valid: true };
  }

  // Plain Text / Markdown
  if (
    mimeType.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md")
  ) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: "Unsupported file format. Please upload a PDF, DOCX, or paste plain text.",
    errorCode: "BAD_REQUEST",
  };
}

/**
 * Readability heuristic for extracted text (RES-2).
 * Determines if extracted text looks scanned, garbled, or empty.
 */
export function assessReadability(text: string, originalFileSize: number): ExtractionResult {
  const trimmed = text.trim();

  // If text is essentially empty
  if (trimmed.length < 30) {
    return {
      status: "failed_unreadable",
      isScannedLike: true,
      errorMessage:
        "Resume appears to be a scanned image or empty. Please use a text-selectable PDF or paste your resume text.",
    };
  }

  // If large file (>10KB) yielded very few characters (<100 chars), it's likely an image-based PDF
  if (originalFileSize > 10 * 1024 && trimmed.length < 120) {
    return {
      status: "failed_unreadable",
      isScannedLike: true,
      errorMessage:
        "Could not extract sufficient text from this document. Image-based/scanned PDFs require pasting text or using an exported PDF.",
    };
  }

  // Check character diversity (prevent garbled binary strings)
  const letters = trimmed.match(/[a-zA-Z0-9]/g) || [];
  const ratio = letters.length / trimmed.length;

  if (ratio < 0.35) {
    return {
      status: "failed_unreadable",
      isScannedLike: true,
      errorMessage:
        "Extracted text contains unreadable encoding or corrupt characters. Please paste your resume text directly.",
    };
  }

  return {
    status: "extracted",
    rawText: trimmed,
  };
}

/**
 * Multimodal document extraction using Google AI Studio Gemini API as an intelligent OCR fallback.
 */
async function extractTextWithGemini(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const models = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-1.5-flash",
  ];
  const uniqueModels = Array.from(new Set(models));

  const base64Data = buffer.toString("base64");
  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "application/pdf",
              data: base64Data,
            },
          },
          {
            text: "Extract all plain text from this technical resume document verbatim. Preserve all sections, work history, projects, metrics, tech stacks, bullet points, and education exactly as written in the resume. Output the full plain text only without markdown backticks or commentary.",
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  for (const m of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length >= 30) {
          return text.trim();
        }
      }
    } catch {
      // Loop to try next model in fallback list
    }
  }

  return null;
}

/**
 * Extracts text from memory buffer without writing to disk (RES-T2, Invariant I-06).
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ExtractionResult> {
  const validation = validateResumeUpload(buffer, mimeType, filename);
  if (!validation.valid) {
    return {
      status: "failed_error",
      errorMessage: validation.reason,
    };
  }

  try {
    const lowerName = filename.toLowerCase();

    // Plain text / markdown
    if (
      mimeType.startsWith("text/") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md")
    ) {
      const text = buffer.toString("utf-8");
      return assessReadability(text, buffer.length);
    }

    // PDF extraction
    if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
      // First attempt parsing with pdf-parse library
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfModule = require("pdf-parse");
        const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse || pdfModule;
        const uint8 = new Uint8Array(buffer);
        const parser = new PDFParseClass({ data: uint8 });
        const parsed = await parser.getText();
        if (typeof parser.destroy === "function") {
          await parser.destroy();
        }
        if (parsed?.text && parsed.text.trim().length > 20) {
          return assessReadability(parsed.text, buffer.length);
        }
      } catch {
        // Fall back to stream regex extraction
      }

      // Basic text stream extractor from PDF buffer without native binary dependencies
      const rawString = buffer.toString("binary");
      const textBlocks: string[] = [];

      // Extract text inside BT ... ET (Begin Text ... End Text) operators or Tj / TJ commands
      const textRegex = /BT[\s\S]*?ET/g;
      let match;
      while ((match = textRegex.exec(rawString)) !== null) {
        const block = match[0];
        const stringMatches = block.match(/\((.*?)\)\s*Tj/g) || [];
        for (const sm of stringMatches) {
          const inner = sm.replace(/^\(/, "").replace(/\)\s*Tj$/, "");
          textBlocks.push(inner);
        }
      }

      const extracted = textBlocks.join(" ").trim();
      const localResult = assessReadability(extracted, buffer.length);
      if (localResult.status === "extracted") {
        return localResult;
      }

      // Intelligent OCR fallback with Gemini AI if local extraction failed/unreadable
      if (process.env.GEMINI_API_KEY) {
        const geminiText = await extractTextWithGemini(buffer, "application/pdf");
        if (geminiText) {
          return {
            status: "extracted",
            rawText: geminiText,
          };
        }
      }

      return localResult;
    }

    // DOCX extraction
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx")
    ) {
      // DOCX stores document.xml inside zip. Extract text tags <w:t>...</w:t>
      const raw = buffer.toString("binary");
      const xmlMatch = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const text = xmlMatch.map((t) => t.replace(/<[^>]+>/g, "")).join(" ");
      return assessReadability(text, buffer.length);
    }

    return {
      status: "failed_unreadable",
      errorMessage: "Unsupported document format.",
    };
  } catch (err) {
    return {
      status: "failed_error",
      errorMessage: `Extraction failed: ${(err as Error).message}`,
    };
  }
}
