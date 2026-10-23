import { LlmGateway, OpenWeightLlmGateway } from "./gateway";
import { FakeLlmGateway } from "./fake-gateway";
import { GeminiLlmGateway } from "./gemini-gateway";

let globalGateway: LlmGateway | null = null;

export function getLlmGateway(): LlmGateway {
  if (globalGateway) return globalGateway;

  // Auto-detect available AI providers from environment variables
  if (process.env.GEMINI_API_KEY || process.env.LLM_PROVIDER === "gemini") {
    globalGateway = new GeminiLlmGateway();
    return globalGateway;
  }

  if (process.env.GROQ_API_KEY) {
    globalGateway = new OpenWeightLlmGateway(
      "https://api.groq.com/openai/v1",
      process.env.GROQ_API_KEY,
      process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    );
    return globalGateway;
  }

  if (process.env.OPENAI_API_KEY) {
    globalGateway = new OpenWeightLlmGateway(
      "https://api.openai.com/v1",
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_MODEL || "gpt-4o-mini"
    );
    return globalGateway;
  }

  const provider = process.env.LLM_PROVIDER;

  if (provider === "openweight" || process.env.OPENWEIGHT_BASE_URL) {
    globalGateway = new OpenWeightLlmGateway();
  } else {
    globalGateway = new FakeLlmGateway();
  }

  return globalGateway;
}

export function setLlmGateway(gateway: LlmGateway): void {
  globalGateway = gateway;
}

export * from "./gateway";
export * from "./fake-gateway";
export * from "./gemini-gateway";
