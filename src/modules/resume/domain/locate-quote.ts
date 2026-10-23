export interface QuoteOffset {
  startOffset: number;
  endOffset: number;
}

/**
 * Normalizes whitespace for quote matching.
 * Replaces sequences of whitespace/newlines with a single space.
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Locates an exact or whitespace-normalized quote inside the full extracted resume text (RES-T3, ADR-3).
 *
 * Invariant I-04: The LLM proposes quotes; the app computes offsets.
 * Discards quote and returns null if not found.
 *
 * Handles:
 * 1. Exact match
 * 2. Whitespace-differing match (e.g. multi-line breaks in raw text normalized by LLM)
 * 3. Repeated quotes: finds the first unused occurrence starting after `startSearchFromOffset`
 */
export function locateQuote(
  rawText: string,
  quoteText: string,
  startSearchFromOffset = 0
): QuoteOffset | null {
  if (!rawText || !quoteText) return null;

  const trimmedQuote = quoteText.trim();
  if (trimmedQuote.length === 0) return null;

  // 1. Try direct exact match from offset
  const directIndex = rawText.indexOf(trimmedQuote, startSearchFromOffset);
  if (directIndex !== -1) {
    return {
      startOffset: directIndex,
      endOffset: directIndex + trimmedQuote.length,
    };
  }

  // 2. Whitespace-tolerant search
  // Create a regex from the quote where each whitespace gap matches 1+ whitespace chars
  const escapedTokens = trimmedQuote
    .split(/\s+/)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escapedTokens.length === 0) return null;

  const patternString = escapedTokens.join("\\s+");

  try {
    const regex = new RegExp(patternString, "g");
    regex.lastIndex = startSearchFromOffset;
    const match = regex.exec(rawText);

    if (match) {
      return {
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      };
    }
  } catch {
    // If regex fails for any reason, continue to fallback
  }

  // 3. Kerning/letter-spacing tolerant search
  // PDF extractors often introduce intra-word spaces (e.g., "D e v e l o p e d")
  try {
    const kerningTokens = trimmedQuote
      .split(/\s+/)
      .map((token) =>
        token
          .split("")
          .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("\\s*")
      );
    if (kerningTokens.length > 0) {
      const kerningPattern = kerningTokens.join("\\s+");
      const kerningRegex = new RegExp(kerningPattern, "gi");
      kerningRegex.lastIndex = startSearchFromOffset;
      const kerningMatch = kerningRegex.exec(rawText);
      if (kerningMatch) {
        return {
          startOffset: kerningMatch.index,
          endOffset: kerningMatch.index + kerningMatch[0].length,
        };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 4. Substring prefix match (first 30 characters) for slightly truncated quotes
  if (trimmedQuote.length > 30) {
    const prefix = trimmedQuote.slice(0, 30);
    const prefixOffset = locateQuote(rawText, prefix, startSearchFromOffset);
    if (prefixOffset) {
      // Find approximate length bounded by raw text
      const estimatedEnd = Math.min(rawText.length, prefixOffset.startOffset + trimmedQuote.length + 20);
      return {
        startOffset: prefixOffset.startOffset,
        endOffset: estimatedEnd,
      };
    }
  }

  return null;
}
