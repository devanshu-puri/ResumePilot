import { NextRequest, NextResponse } from "next/server";
import { setLlmGateway } from "@/shared/llm";
import { GeminiLlmGateway } from "@/shared/llm/gemini-gateway";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = (body.geminiApiKey as string || "").trim();
    const model = (body.geminiModel as string || "gemini-1.5-flash").trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key cannot be empty" },
        { status: 400 }
      );
    }

    // Set in process memory
    process.env.GEMINI_API_KEY = apiKey;
    process.env.GEMINI_MODEL = model;
    process.env.LLM_PROVIDER = "gemini";

    // Set global gateway instance
    setLlmGateway(new GeminiLlmGateway(apiKey, model));

    // Persist to .env file if accessible
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${apiKey}"`);
      } else {
        content += `\nGEMINI_API_KEY="${apiKey}"\n`;
      }
      fs.writeFileSync(envPath, content, "utf-8");
    } catch {
      // Ignore filesystem write error if environment is read-only
    }

    return NextResponse.json({
      success: true,
      provider: "gemini",
      model,
      message: "Google Gemini AI successfully configured and activated!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({
    provider: process.env.LLM_PROVIDER || "gemini",
    configured,
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });
}
