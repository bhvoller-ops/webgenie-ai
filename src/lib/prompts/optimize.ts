import type { PromptDocument } from "./types";

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

export function optimizePromptDocuments(documents: PromptDocument[]): PromptDocument[] {
  const seenParagraphs = new Set<string>();
  return documents.map((document) => {
    const paragraphs = normalizeMarkdown(document.markdown).split(/\n\n+/);
    const optimized = paragraphs.filter((paragraph) => {
      if (paragraph.startsWith("#") || paragraph.length < 80) return true;
      const key = paragraph.toLowerCase().replace(/\s+/g, " ").trim();
      if (seenParagraphs.has(key)) return false;
      seenParagraphs.add(key);
      return true;
    }).join("\n\n");
    return { ...document, markdown: optimized, estimatedTokens: Math.ceil(optimized.length / 4) };
  });
}
