import { LlmGateway, OpenWeightLlmGateway } from "./gateway";
import { FakeLlmGateway } from "./fake-gateway";
import { GeminiLlmGateway } from "./gemini-gateway";

let globalGateway: LlmGateway | null = null;

export function getLlmGateway(): LlmGateway {
  if (globalGateway) return globalGateway;

  const provider = (process.env.LLM_PROVIDER || "").toLowerCase().trim();

  if (
    provider === "google-ai" ||
    provider === "gemini" ||
    (provider !== "fake" && provider !== "openweight" && process.env.GEMINI_API_KEY)
  ) {
    globalGateway = new GeminiLlmGateway();
  } else if (provider === "openweight") {
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

