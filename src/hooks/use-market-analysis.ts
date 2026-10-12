"use client";

import { useEffect, useRef, useState } from "react";

import {
  marketQuery,
  marketSnapshotSchema,
  type MarketFilters,
  type MarketSnapshot,
} from "@/lib/market-analysis";

export function useMarketAnalysis(initialFilters: MarketFilters, initialSnapshot: MarketSnapshot) {
  const [filters, setFilters] = useState(initialFilters);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => () => requestController.current?.abort(), []);

  async function updateFilters(nextFilters: MarketFilters) {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setFilters(nextFilters);
    setIsLoading(true);
    setError("");

    const query = marketQuery(nextFilters);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);

    try {
      const response = await fetch(`/api/market-analysis?${query}`, { signal: controller.signal });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "message" in body
          ? String(body.message)
          : "Market analysis could not be updated.";
        throw new Error(message);
      }
      const parsed = marketSnapshotSchema.safeParse(body);
      if (!parsed.success) throw new Error("Market analysis returned invalid data.");
      setSnapshot(parsed.data);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "Market analysis could not be updated.");
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }

  return { filters, snapshot, isLoading, error, updateFilters };
}