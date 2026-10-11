"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  estimateRecordSchema,
  type EstimateRecord,
  type PropertyInput,
} from "@/lib/property";

const STORAGE_KEY = "marketanalysis.estimates.v1";

type NewEstimate = {
  label: string;
  property: PropertyInput;
  predictedPrice: number;
};

type EstimatesContextValue = {
  entries: EstimateRecord[];
  isReady: boolean;
  addEstimate: (estimate: NewEstimate) => void;
  removeEstimate: (id: string) => void;
  clearHistory: () => void;
};

const EstimatesContext = createContext<EstimatesContextValue | null>(null);

export function EstimatesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<EstimateRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const result = estimateRecordSchema.array().safeParse(parsed);
        if (result.success) setEntries(result.data.slice(0, 50));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isReady]);

  const addEstimate = useCallback((estimate: NewEstimate) => {
    const entry: EstimateRecord = {
      ...estimate,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries((current) => [entry, ...current].slice(0, 50));
  }, []);

  const removeEstimate = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => setEntries([]), []);

  return (
    <EstimatesContext.Provider
      value={{ entries, isReady, addEstimate, removeEstimate, clearHistory }}
    >
      {children}
    </EstimatesContext.Provider>
  );
}

export function useEstimates(): EstimatesContextValue {
  const context = useContext(EstimatesContext);
  if (!context) throw new Error("useEstimates must be used inside EstimatesProvider.");
  return context;
}