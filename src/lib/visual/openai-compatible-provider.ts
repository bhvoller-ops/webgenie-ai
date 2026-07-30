import crypto from "node:crypto";
import { modelVisualResponseSchema } from "./schema";
import type { VisualAnalysisInput, VisualAnalysisProvider, VisualAnalysisResult } from "./types";

const SYSTEM_PROMPT = `You are WebGenie's senior visual website auditor. Evaluate only what is visible in the screenshot. Return strict JSON. Score hierarchy, typography, spacing, color, consistency, credibility, and mobileReadiness from 0-100. Distinguish direct visual evidence from assumptions. Do not infer business facts that are not visible. Recommendations must be specific, original, and implementation-ready.`;

export class OpenAICompatibleVisualProvider implements VisualAnalysisProvider {
  readonly name: string;
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(args: { name?: string; apiKey: string; model: string; baseUrl?: string }) {
    this.name = args.name ?? "openai-compatible";
    this.apiKey = args.apiKey;
    this.model = args.model;
    this.baseUrl = (args.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  }

  async analyze(input: VisualAnalysisInput): Promise<VisualAnalysisResult> {
    const image = Buffer.from(input.screenshotBytes).toString("base64");
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze ${input.sourceUrl}. Page title: ${input.pageTitle ?? "unknown"}. Visible-text context: ${(input.visibleTextExcerpt ?? "").slice(0, 1500)}. Return keys: metrics, strengths, weaknesses, recommendations.` },
              { type: "image_url", image_url: { url: `data:${input.mimeType};base64,${image}`, detail: "high" } }
            ]
          }
        ]
      }),
      signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
      throw new Error(`VISUAL_PROVIDER_HTTP_${response.status}: ${(await response.text()).slice(0, 500)}`);
    }

    const payload = await response.json() as any;
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("VISUAL_PROVIDER_EMPTY_RESPONSE");
    const parsed = modelVisualResponseSchema.parse(JSON.parse(content));
    const values = Object.values(parsed.metrics);
    const overallScore = Math.round(values.reduce((s, value) => s + value.score, 0) / values.length);
    const overallConfidence = Math.round(values.reduce((s, value) => s + value.confidence, 0) / values.length);
    const evidence = values.flatMap((value) => value.evidence).slice(0, 20).map((detail) => ({
      sourceCaptureId: input.captureId,
      sourceUrl: input.sourceUrl,
      type: "visual_model_observation",
      detail,
      weight: 1
    }));

    return {
      schemaVersion: "1.0",
      provider: this.name,
      model: this.model,
      sourceCaptureId: input.captureId,
      sourceUrl: input.sourceUrl,
      analyzedAt: new Date().toISOString(),
      metrics: parsed.metrics,
      overallScore,
      overallConfidence,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      recommendations: parsed.recommendations.map((item) => ({
        id: crypto.randomUUID(),
        module: "design",
        ...item,
        evidence
      })),
      evidence,
      raw: { usage: payload?.usage ?? null }
    };
  }
}
