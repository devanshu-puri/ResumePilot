import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/shared/auth/user";
import { resumeService } from "@/modules/resume/services/resume-service";
import { defaultRateLimiter } from "@/shared/security/rate-limit";
import { AppError } from "@/shared/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);

    // Rate limiting: max 10 uploads per 5 minutes per user
    defaultRateLimiter.enforce(`${user.id}:upload-resume`, 10, 300000);

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        throw AppError.badRequest("No file uploaded in form data.");
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await resumeService.processResume(user.id, {
        buffer,
        mimeType: file.type || "application/pdf",
        filename: file.name,
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.text || typeof body.text !== "string") {
        throw AppError.badRequest("JSON body must contain a 'text' string field.");
      }

      const result = await resumeService.processResume(user.id, {
        text: body.text,
      });

      return NextResponse.json(result, { status: 201 });
    }

    throw AppError.badRequest("Expected multipart/form-data or application/json.");
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    const internal = AppError.internal((err as Error).message);
    return NextResponse.json(internal.toSafeResponse(), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const active = await resumeService.getActiveResume(user.id);
    if (!active) {
      return NextResponse.json({ resume: null }, { status: 200 });
    }
    return NextResponse.json({ resume: active }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toSafeResponse(), { status: err.statusCode });
    }
    return NextResponse.json(AppError.internal().toSafeResponse(), { status: 500 });
  }
}
