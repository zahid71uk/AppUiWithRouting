import { NextResponse } from "next/server";

import { parseMarketFilters } from "@/lib/market-analysis";
import { getMarketSnapshot, MarketAnalysisApiError } from "@/lib/market-analysis-server";

export async function GET(request: Request) {
  const filters = parseMarketFilters(new URL(request.url).searchParams);
  try {
    return NextResponse.json(await getMarketSnapshot(filters));
  } catch (error) {
    const status = error instanceof MarketAnalysisApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : "Market analysis service is unavailable.";
    return NextResponse.json({ message }, { status });
  }
}