import { NextResponse } from "next/server";

import { estimateRequestSchema } from "@/lib/property";
import { logServerError } from "@/lib/server-log";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = estimateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Request data is invalid.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const baseUrl = process.env.VALUEESTIMATOR_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { message: "The estimate service is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/estimates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(parsed.data.house),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const responseBody: unknown = await response.json().catch(() => ({
      message: "The estimate service returned an invalid response.",
    }));
    if (response.status >= 500) {
      logServerError("estimate.upstream-failure", null, { statusCode: response.status });
    }
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logServerError("estimate.request-failed", error, { statusCode: timedOut ? 504 : 503 });
    return NextResponse.json(
      {
        message: timedOut
          ? "The estimate service took too long to respond. Please try again."
          : "The estimate service is unavailable. Please try again later.",
      },
      { status: timedOut ? 504 : 503 },
    );
  }
}