import { HeuristicVisualProvider } from "./heuristic-provider";
import { OpenAICompatibleVisualProvider } from "./openai-compatible-provider";
import type { VisualAnalysisProvider } from "./types";

export function createVisualAnalysisProvider(): VisualAnalysisProvider {
  const provider = (process.env.VISUAL_AI_PROVIDER ?? "heuristic").toLowerCase();

  if (provider === "openai" || provider === "openai-compatible") {
    const apiKey = process.env.VISUAL_AI_API_KEY || process.env.OPENAI_API_KEY;
    const model = process.env.VISUAL_AI_MODEL;
    if (!apiKey || !model) {
      throw new Error("VISUAL_AI_API_KEY and VISUAL_AI_MODEL are required for model-assisted visual analysis.");
    }

    return new OpenAICompatibleVisualProvider({
      name: provider,
      apiKey,
      model,
      baseUrl: process.env.VISUAL_AI_BASE_URL
    });
  }

  return new HeuristicVisualProvider();
}
