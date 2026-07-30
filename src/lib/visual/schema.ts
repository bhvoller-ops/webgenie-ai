import { z } from "zod";

const metricSchema = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(1).max(600),
  evidence: z.array(z.string().min(1).max(400)).max(12)
});

export const modelVisualResponseSchema = z.object({
  metrics: z.object({
    hierarchy: metricSchema,
    typography: metricSchema,
    spacing: metricSchema,
    color: metricSchema,
    consistency: metricSchema,
    credibility: metricSchema,
    mobileReadiness: metricSchema
  }),
  strengths: z.array(z.string().min(1).max(300)).max(8),
  weaknesses: z.array(z.string().min(1).max(300)).max(8),
  recommendations: z.array(z.object({
    priority: z.enum(["critical", "high", "medium", "low"]),
    title: z.string().min(1).max(140),
    rationale: z.string().min(1).max(600),
    action: z.string().min(1).max(600),
    confidence: z.number().min(0).max(100)
  })).max(12)
});

export type ModelVisualResponse = z.infer<typeof modelVisualResponseSchema>;
