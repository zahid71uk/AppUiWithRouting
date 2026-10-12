import type { Metadata } from "next";

import { MarketDashboard } from "@/components/market-dashboard";
import { defaultMarketFilters, parseMarketFilters } from "@/lib/market-analysis";
import { getMarketSnapshot } from "@/lib/market-analysis-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market analysis | Parcel",
  description: "Descriptive analysis of the supplied housing sample.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MarketAnalysisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const filters = Object.keys(params).length > 0 ? parseMarketFilters(query) : defaultMarketFilters;
  const snapshot = await getMarketSnapshot(filters);

  return <MarketDashboard initialFilters={filters} initialSnapshot={snapshot} />;
}