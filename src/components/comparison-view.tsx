"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";

import { useEstimates } from "@/hooks/use-estimates";
import { formatFeature, formatPrice } from "@/lib/format";
import type { EstimateRecord } from "@/lib/property";

const features: { key: keyof EstimateRecord["property"]; label: string; format?: (value: number) => string }[] = [
  { key: "square_footage", label: "Interior area", format: (value) => `${formatFeature(value, 0)} sq ft` },
  { key: "bedrooms", label: "Bedrooms", format: (value) => formatFeature(value, 0) },
  { key: "bathrooms", label: "Bathrooms", format: (value) => formatFeature(value) },
  { key: "year_built", label: "Year built", format: (value) => formatFeature(value, 0) },
  { key: "lot_size", label: "Lot size", format: (value) => `${formatFeature(value, 0)} sq ft` },
  { key: "distance_to_city_center", label: "Distance to center", format: (value) => `${formatFeature(value)} mi` },
  { key: "school_rating", label: "School rating", format: (value) => `${formatFeature(value)} / 10` },
];

export function ComparisonView() {
  const { entries, isReady } = useEstimates();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(entries.slice(0, 4).map((entry) => entry.id));
  }, [entries]);

  const selected = entries.filter((entry) => selectedIds.includes(entry.id));
  const chartData = selected.map((entry) => ({
    label: entry.label,
    estimate: entry.predictedPrice,
  }));

  const toggle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : current.length < 5
          ? [...current, id]
          : current,
    );
  };

  if (!isReady) return <div className="empty-state" aria-live="polite">Loading saved estimates…</div>;
  if (entries.length === 0) {
    return (
      <div className="empty-state history-empty">
        <p>No properties to compare</p>
        <span>Create estimates to build a side-by-side view.</span>
        <Link className="button button-primary" href="/">Create estimate <span aria-hidden="true">↗</span></Link>
      </div>
    );
  }

  return (
    <div className="compare-layout grid grid-cols-1 gap-[17px] lg:grid-cols-[minmax(230px,.28fr)_minmax(0,.72fr)]">
      <aside className="selection-panel" aria-labelledby="selection-heading">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">SAVED ESTIMATES</p>
            <h2 id="selection-heading">Choose properties</h2>
          </div>
          <span className="selection-count">{selected.length}/5</span>
        </div>
        <fieldset className="selection-list">
          <legend className="sr-only">Select saved estimates to compare</legend>
          {entries.map((entry) => (
            <label className="selection-option" key={entry.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(entry.id)}
                onChange={() => toggle(entry.id)}
                disabled={!selectedIds.includes(entry.id) && selected.length >= 5}
              />
              <span className="selection-copy">
                <strong>{entry.label}</strong>
                <small>{formatPrice(entry.predictedPrice)}</small>
              </span>
            </label>
          ))}
        </fieldset>
      </aside>

      <section className="comparison-panel" aria-labelledby="comparison-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ESTIMATE COMPARISON</p>
            <h2 id="comparison-heading">Side by side</h2>
          </div>
          <span className="model-note">Model estimates</span>
        </div>

        {selected.length === 0 ? (
          <div className="empty-state">Select saved properties to compare.</div>
        ) : (
          <>
            <div className="compare-chart" role="img" aria-label="Chart comparing selected predicted prices">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 12, left: 10, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="#e7ece9" strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#52625b", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 10 }} tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value: number) => [formatPrice(value), "Estimate"]} />
                  <Legend />
                  <Bar dataKey="estimate" name="Predicted price" fill="#176b58" radius={[4, 4, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-scroll compare-table-scroll">
              <table className="data-table compare-table">
                <thead>
                  <tr>
                    <th scope="col">Property details</th>
                    {selected.map((entry) => <th scope="col" key={entry.id}>{entry.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr className="compare-price-row">
                    <th scope="row">Predicted price</th>
                    {selected.map((entry) => <td key={entry.id}>{formatPrice(entry.predictedPrice)}</td>)}
                  </tr>
                  {features.map((feature) => (
                    <tr key={feature.key}>
                      <th scope="row">{feature.label}</th>
                      {selected.map((entry) => {
                        const value = entry.property[feature.key];
                        return <td key={entry.id}>{feature.format?.(value) ?? value}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}