"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, ChartNoAxesColumnIncreasing } from "lucide-react";
import Link from "next/link";

import { useEstimates } from "@/hooks/use-estimates";
import { formatDate, formatFeature, formatPrice } from "@/lib/format";

export function EstimateResults() {
  const { entries, isReady } = useEstimates();
  const recent = entries.slice(0, 6).reverse();

  return (
    <section className="results-panel" aria-labelledby="results-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MODEL OUTPUT</p>
          <h2 id="results-heading">Estimate history</h2>
        </div>
        {entries.length > 0 && (
          <span className="count-mark">{entries.length.toString().padStart(2, "0")}</span>
        )}
      </div>

      {!isReady ? (
        <div className="empty-state" aria-live="polite">Loading saved estimates…</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><ChartNoAxesColumnIncreasing size={23} aria-hidden="true" /></span>
          <p>No estimates yet</p>
          <span>Your latest result will appear here.</span>
        </div>
      ) : (
        <>
          <div className="chart-frame" role="img" aria-label="Bar chart of recent predicted prices">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recent} margin={{ top: 8, right: 2, left: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="#e7ece9" strokeDasharray="3 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 11 }} />
                <YAxis
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#71817a", fontSize: 10 }}
                  tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), "Estimate"]}
                  cursor={{ fill: "#edf4f1" }}
                />
                <Bar dataKey="predictedPrice" fill="#176b58" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="recent-list" aria-label="Most recent estimates">
            {entries.slice(0, 4).map((entry) => (
              <div className="recent-row" key={entry.id}>
                <div className="recent-name">
                  <span className="row-marker" aria-hidden="true" />
                  <span>{entry.label}</span>
                  <small>{formatDate(entry.createdAt)}</small>
                </div>
                <strong>{formatPrice(entry.predictedPrice)}</strong>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/history">
            View all estimates <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <div className="latest-specs">
            <p className="eyebrow">LATEST PROPERTY</p>
            <span>{formatFeature(entries[0].property.square_footage, 0)} sq ft</span>
            <span>{entries[0].property.bedrooms} bed</span>
            <span>{formatFeature(entries[0].property.bathrooms)} bath</span>
            <span>Built {entries[0].property.year_built}</span>
          </div>
        </>
      )}
    </section>
  );
}