import type { IntelligenceCaptureInput } from "../input";
import type { EvidenceItem, ModuleScore } from "../types";
import {
  average,
  confidenceFromEvidence,
  createRecommendation,
  normalizeModuleScore
} from "../scoring-utils";

export function scoreAiSearch(
  captures: IntelligenceCaptureInput[]
): ModuleScore {
  const evidence: EvidenceItem[] = [];
  const scores: number[] = [];

  for (const capture of captures) {
    const schemaTypes = capture.features.schemaTypes ?? [];
    const headings = capture.features.headings ?? [];
    const questionHeadings = headings.filter((heading) =>
      /\?$|^(what|how|why|when|where|who|can|does|is|are)\b/i.test(heading.text)
    ).length;

    let score = 30;
    if (capture.description) score += 10;
    if (schemaTypes.length > 0) score += 20;
    if (questionHeadings >= 2) score += 15;
    if (capture.visibleText.split(/\s+/).length >= 500) score += 15;
    if (/about|contact|services|products/i.test(capture.visibleText)) score += 10;

    evidence.push({
      sourceCaptureId: capture.captureId,
      sourceUrl: capture.sourceUrl,
      type: "ai_search_signals",
      detail: `Schema types: ${schemaTypes.length}; question headings: ${questionHeadings}; text depth: ${capture.visibleText.split(/\s+/).length} words`,
      weight: 1
    });

    scores.push(score);
  }

  const recommendations = [
    createRecommendation({
      module: "ai_search",
      priority: "high",
      title: "Create answer-ready content blocks",
      rationale:
        "AI discovery systems work best with clear entities, direct answers, structured facts, and supporting evidence.",
      action:
        "Add concise question-and-answer sections, service definitions, geographic relevance, credentials, and source-supported claims.",
      evidence,
      confidence: confidenceFromEvidence(evidence.length, captures.length)
    })
  ];

  return normalizeModuleScore({
    module: "ai_search",
    score: average(scores),
    confidence: confidenceFromEvidence(evidence.length, captures.length),
    strengths: scores.some((score) => score >= 70)
      ? ["Some content is structured in a way that can support AI-generated answers."]
      : [],
    weaknesses: scores.some((score) => score < 60)
      ? ["Entity clarity, structured facts, and answer-ready content are limited."]
      : [],
    evidence,
    recommendations
  });
}
