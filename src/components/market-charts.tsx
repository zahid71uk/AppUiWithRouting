"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { HousingRecord } from "@/lib/market-analysis";
import { formatPrice } from "@/lib/format";

type MarketChartsProps = { properties: HousingRecord[] };

export function MarketCharts({ properties }: MarketChartsProps) {
  const grouped = new Map<number, { total: number; count: number }>();
  for (const property of properties) {
    const current = grouped.get(property.bedrooms) ?? { total: 0, count: 0 };
    current.total += property.price;
    current.count += 1;
    grouped.set(property.bedrooms, current);
  }
  const bedroomData = [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([bedrooms, values]) => ({ bedrooms, meanPrice: values.total / values.count }));

  return (
    <div className="market-chart-grid">
      <section className="analysis-panel market-chart-panel" aria-labelledby="bedroom-chart-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SEGMENT COMPARISON</p>
            <h2 id="bedroom-chart-title">Mean price by bedrooms</h2>
          </div>
          <span className="chart-unit">USD</span>
        </div>
        {bedroomData.length === 0 ? (
          <div className="empty-state chart-empty">No sample rows match these filters.</div>
        ) : (
          <div className="market-chart" role="img" aria-label="Mean sample price grouped by bedroom count">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedroomData} margin={{ top: 8, right: 10, left: 8, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="#e7ece9" strokeDasharray="3 4" />
                <XAxis dataKey="bedrooms" tickFormatter={(value: number) => `${value}`} tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 10 }} />
                <YAxis tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 10 }} width={48} />
                <Tooltip formatter={(value: number) => [formatPrice(value), "Mean price"]} labelFormatter={(value) => `${value} bedrooms`} />
                <Bar dataKey="meanPrice" name="Mean sample price" fill="#176b58" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="analysis-panel market-chart-panel" aria-labelledby="scatter-chart-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PROPERTY DISTRIBUTION</p>
            <h2 id="scatter-chart-title">Sample price and area</h2>
          </div>
          <span className="chart-unit">BY RECORD</span>
        </div>
        {properties.length === 0 ? (
          <div className="empty-state chart-empty">No sample rows match these filters.</div>
        ) : (
          <div className="market-chart" role="img" aria-label="Sample prices plotted against square footage">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid stroke="#e7ece9" strokeDasharray="3 4" />
                <XAxis dataKey="square_footage" name="Square footage" type="number" tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 10 }} />
                <YAxis dataKey="price" name="Sample price" type="number" tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: "#71817a", fontSize: 10 }} width={48} />
                <ZAxis dataKey="bedrooms" range={[48, 96]} name="Bedrooms" />
                <Tooltip formatter={(value: number, name: string) => name === "Sample price" ? formatPrice(value) : value} />
                <Scatter data={properties} fill="#c95840" fillOpacity={0.78} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}