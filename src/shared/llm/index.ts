import { LlmGateway, OpenWeightLlmGateway } from "./gateway";
import { FakeLlmGateway } from "./fake-gateway";

let globalGateway: LlmGateway | null = null;

export function getLlmGateway(): LlmGateway {
  if (globalGateway) return globalGateway;

  const provider = process.env.LLM_PROVIDER || "fake";

  if (provider === "openweight") {
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
