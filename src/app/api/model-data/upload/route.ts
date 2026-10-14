import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { logServerError } from "@/lib/server-log";

const fallbackMaximumBytes = 5 * 1024 * 1024;

function uploadTokenMatches(supplied: string | null, expected: string): boolean {
  if (!supplied) return false;
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}

export async function POST(request: Request) {
  if (process.env.DATASET_UPLOAD_ENABLED !== "true") {
    return NextResponse.json({ message: "Dataset upload is disabled." }, { status: 404 });
  }
  const expectedToken = process.env.DATASET_UPLOAD_TOKEN ?? "";
  if (!expectedToken) {
    return NextResponse.json({ message: "Dataset upload authentication is not configured." }, { status: 503 });
  }
  if (!uploadTokenMatches(request.headers.get("X-Dataset-Upload-Token"), expectedToken)) {
    return NextResponse.json({ message: "Invalid upload token." }, { status: 401 });
  }

  const maximumBytes = Number.parseInt(process.env.MAX_DATASET_UPLOAD_BYTES ?? String(fallbackMaximumBytes), 10);
  if (!Number.isFinite(maximumBytes) || maximumBytes <= 0) {
    return NextResponse.json({ message: "Dataset upload size is not configured." }, { status: 503 });
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const requestSize = Number.parseInt(contentLength, 10);
    if (!Number.isSafeInteger(requestSize) || requestSize < 0) {
      return NextResponse.json({ message: "Invalid request size." }, { status: 400 });
    }
    if (requestSize > maximumBytes + 64 * 1024) {
      return NextResponse.json({ message: "The selected file exceeds the upload limit." }, { status: 413 });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Choose a valid CSV file." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ message: "Choose a CSV file." }, { status: 422 });
  }
  if (file.size > maximumBytes) {
    return NextResponse.json({ message: "The selected file exceeds the upload limit." }, { status: 413 });
  }

  const baseUrl = (process.env.PRICE_PREDICTION_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  const backendForm = new FormData();
  backendForm.append("file", file, file.name);
  try {
    const response = await fetch(`${baseUrl}/api/v1/dataset/upload`, {
      method: "POST",
      headers: { "X-Dataset-Upload-Token": expectedToken },
      body: backendForm,
      cache: "no-store",
      signal: AbortSignal.timeout(90_000),
    });
    const responseBody: unknown = await response.json().catch(() => ({ message: "The training service returned an invalid response." }));
    if (response.status >= 500) {
      logServerError("dataset-upload.upstream-failure", null, { statusCode: response.status });
    }
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logServerError("dataset-upload.request-failed", error, { statusCode: timedOut ? 504 : 503 });
    return NextResponse.json(
      { message: timedOut ? "Training took too long to respond." : "The training service is unavailable." },
      { status: timedOut ? 504 : 503 },
    );
  }
}