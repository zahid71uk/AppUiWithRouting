import {
  marketSnapshotSchema,
  marketQuery,
  type MarketFilters,
  type MarketSnapshot,
} from "@/lib/market-analysis";
import { logServerError } from "@/lib/server-log";

export class MarketAnalysisApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function getMarketSnapshot(filters: MarketFilters): Promise<MarketSnapshot> {
  const baseUrl = (process.env.MARKET_ANALYSIS_API_URL ?? "http://127.0.0.1:8082").replace(/\/+$/, "");
  const query = marketQuery(filters);
  query.set("page", "0");
  query.set("size", "100");

  try {
    const [summaryResponse, propertiesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/market-analysis/summary?${query}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(9_000),
      }),
      fetch(`${baseUrl}/api/v1/market-analysis/properties?${query}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(9_000),
      }),
    ]);
    if (!summaryResponse.ok || !propertiesResponse.ok) {
      throw new MarketAnalysisApiError("Market analysis service returned an error.", 502);
    }
    const [summary, properties] = await Promise.all([summaryResponse.json(), propertiesResponse.json()]);
    const parsed = marketSnapshotSchema.safeParse({ summary, properties });
    if (!parsed.success) {
      throw new MarketAnalysisApiError("Market analysis service returned invalid data.", 502);
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof MarketAnalysisApiError) {
      logServerError("market-analysis.upstream-failure", error, { statusCode: error.status });
      throw error;
    }
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logServerError("market-analysis.fetch-failed", error, { statusCode: timedOut ? 504 : 503 });
    throw new MarketAnalysisApiError(
      timedOut ? "Market analysis service timed out." : "Market analysis service is unavailable.",
      timedOut ? 504 : 503,
    );
  }
}