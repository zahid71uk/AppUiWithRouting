"use client";

import { ArrowUpRight, Trash2 } from "lucide-react";
import Link from "next/link";

import { useEstimates } from "@/hooks/use-estimates";
import { formatDate, formatFeature, formatPrice } from "@/lib/format";

export function HistoryTable() {
  const { entries, isReady, removeEstimate, clearHistory } = useEstimates();

  if (!isReady) return <div className="empty-state" aria-live="polite">Loading saved estimates…</div>;
  if (entries.length === 0) {
    return (
      <div className="empty-state history-empty">
        <p>No saved estimates</p>
        <span>Completed estimates will be kept in this browser.</span>
        <Link className="button button-primary" href="/">Create estimate <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="table-toolbar">
        <span>{entries.length} saved {entries.length === 1 ? "estimate" : "estimates"}</span>
        <button
          className="button button-quiet"
          type="button"
          onClick={() => {
            if (window.confirm("Clear all saved estimates from this browser?")) clearHistory();
          }}
        >
          <Trash2 size={15} aria-hidden="true" /> Clear history
        </button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Area</th>
              <th scope="col">Beds / baths</th>
              <th scope="col">Year built</th>
              <th scope="col">Estimated price</th>
              <th scope="col">Created</th>
              <th scope="col"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <th scope="row">{entry.label}</th>
                <td>{formatFeature(entry.property.square_footage, 0)} sq ft</td>
                <td>{entry.property.bedrooms} / {formatFeature(entry.property.bathrooms)}</td>
                <td>{entry.property.year_built}</td>
                <td className="price-cell">{formatPrice(entry.predictedPrice)}</td>
                <td>{formatDate(entry.createdAt)}</td>
                <td>
                  <button
                    className="icon-button"
                    type="button"
                    title={`Remove ${entry.label}`}
                    aria-label={`Remove ${entry.label} from history`}
                    onClick={() => removeEstimate(entry.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}