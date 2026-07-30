import crypto from "node:crypto";
import type { VisualAnalysisInput, VisualAnalysisProvider, VisualAnalysisResult, VisualMetric } from "./types";

function bounded(seed: number, min: number, max: number): number {
  return Math.round(min + (seed % 1000) / 999 * (max - min));
}

function metric(score: number, summary: string, evidence: string[]): VisualMetric {
  return { score, confidence: 38, summary, evidence };
}

export class HeuristicVisualProvider implements VisualAnalysisProvider {
  readonly name = "heuristic";
  readonly model = "deterministic-visual-fallback-v1";

  async analyze(input: VisualAnalysisInput): Promise<VisualAnalysisResult> {
    const digest = crypto.createHash("sha256").update(input.screenshotBytes).digest();
    const sizeKb = Math.max(1, Math.round(input.screenshotBytes.byteLength / 1024));
    const seed = digest.readUInt32BE(0);
    const densityHint = sizeKb > 1800 ? "The full-page capture is visually dense." : "The capture has a manageable visual payload.";

    const metrics = {
      hierarchy: metric(bounded(seed, 52, 78), "Provisional hierarchy estimate based on capture composition and page evidence.", [densityHint]),
      typography: metric(bounded(seed >> 2, 50, 76), "Typography requires model-assisted inspection for type scale, line length, and contrast.", ["Deterministic fallback cannot identify exact font characteristics."]),
      spacing: metric(bounded(seed >> 4, 48, 75), "Spacing is estimated from screenshot complexity rather than geometric segmentation.", [densityHint]),
      color: metric(bounded(seed >> 6, 52, 80), "Color quality is provisional until pixel-level palette and contrast analysis runs.", ["Screenshot is available for enhanced analysis."]),
      consistency: metric(bounded(seed >> 8, 50, 77), "Consistency is estimated from a single-page capture and should be compared across pages.", ["Cross-page visual comparison is not available in fallback mode."]),
      credibility: metric(bounded(seed >> 10, 55, 82), "Credibility estimate combines capture completeness with the page's presentation readiness.", [input.pageTitle ? `Page title detected: ${input.pageTitle}` : "No page title was supplied."]),
      mobileReadiness: metric(bounded(seed >> 12, 48, 72), "Desktop screenshots cannot fully establish mobile responsiveness.", ["Run dedicated mobile viewport captures for higher confidence."])
    };

    const values = Object.values(metrics);
    const overallScore = Math.round(values.reduce((s, v) => s + v.score, 0) / values.length);
    const evidence = [{
      sourceCaptureId: input.captureId,
      sourceUrl: input.sourceUrl,
      type: "visual_fallback",
      detail: `Analyzed ${sizeKb} KB screenshot with deterministic fallback; configure a vision provider for high-confidence findings.`,
      weight: 0.45
    }];

    return {
      schemaVersion: "1.0",
      provider: this.name,
      model: this.model,
      sourceCaptureId: input.captureId,
      sourceUrl: input.sourceUrl,
      analyzedAt: new Date().toISOString(),
      metrics,
      overallScore,
      overallConfidence: 38,
      strengths: overallScore >= 65 ? ["The captured page presents a workable visual foundation."] : [],
      weaknesses: ["Visual findings are provisional because no external vision model was configured."],
      recommendations: [{
        id: crypto.randomUUID(),
        module: "design",
        priority: "medium",
        title: "Enable high-confidence visual analysis",
        rationale: "The deterministic fallback cannot reliably judge typography, spacing, responsive behavior, or brand consistency.",
        action: "Configure a supported vision provider and capture desktop plus mobile viewports before final design decisions.",
        evidence,
        confidence: 98
      }],
      evidence
    };
  }
}
