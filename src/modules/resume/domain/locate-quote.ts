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
    // If regex fails for any reason, return null
    return null;
  }

  return null;
}
