import { NextResponse } from "next/server";

import { propertySchema, type PropertyInput } from "@/lib/property";
import { whatIfResponseSchema } from "@/lib/market-analysis";
import { logServerError } from "@/lib/server-log";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Enter valid property details." }, { status: 400 });
  }

  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Check the property fields and try again.", errors: parsed.error.issues }, { status: 422 });
  }

  const baseUrl = (process.env.MARKET_ANALYSIS_API_URL ?? "http://127.0.0.1:8082").replace(/\/+$/, "");
  try {
    const response = await fetch(`${baseUrl}/api/v1/market-analysis/what-if`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(parsed.data satisfies PropertyInput),
      cache: "no-store",
      signal: AbortSignal.timeout(11_000),
    });
    const responseBody: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status >= 500) {
        logServerError("what-if.upstream-failure", null, { statusCode: response.status });
      }
      return NextResponse.json(
        { message: response.status === 400 || response.status === 422 ? "The property details were rejected." : "The estimate service is unavailable." },
        { status: response.status === 400 || response.status === 422 ? response.status : 502 },
      );
    }
    const result = whatIfResponseSchema.safeParse(responseBody);
    if (!result.success) {
      logServerError("what-if.invalid-upstream-response", null, { statusCode: 502 });
      return NextResponse.json({ message: "The estimate service returned invalid data." }, { status: 502 });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logServerError("what-if.request-failed", error, { statusCode: timedOut ? 504 : 503 });
    return NextResponse.json(
      { message: timedOut ? "The estimate request timed out." : "The analysis service is unavailable." },
      { status: timedOut ? 504 : 503 },
    );
  }
}