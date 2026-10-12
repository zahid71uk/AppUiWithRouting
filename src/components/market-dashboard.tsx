"use client";

import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Printer } from "lucide-react";

import { MarketCharts } from "@/components/market-charts";
import { WhatIfForm } from "@/components/what-if-form";
import { useMarketAnalysis } from "@/hooks/use-market-analysis";
import { formatFeature, formatPrice } from "@/lib/format";
import {
  defaultMarketFilters,
  exportPropertiesCsv,
  marketFilterSchema,
  type MarketFilters,
  type MarketSnapshot,
} from "@/lib/market-analysis";

type FilterDraft = Record<
  "minSquareFootage" | "maxSquareFootage" | "minBedrooms" | "maxBedrooms" | "minYearBuilt" | "maxYearBuilt",
  string
>;

type MarketDashboardProps = { initialFilters: MarketFilters; initialSnapshot: MarketSnapshot };

function toDraft(filters: MarketFilters): FilterDraft {
  return {
    minSquareFootage: filters.minSquareFootage?.toString() ?? "",
    maxSquareFootage: filters.maxSquareFootage?.toString() ?? "",
    minBedrooms: filters.minBedrooms?.toString() ?? "",
    maxBedrooms: filters.maxBedrooms?.toString() ?? "",
    minYearBuilt: filters.minYearBuilt?.toString() ?? "",
    maxYearBuilt: filters.maxYearBuilt?.toString() ?? "",
  };
}

export function MarketDashboard({ initialFilters, initialSnapshot }: MarketDashboardProps) {
  const { filters, snapshot, isLoading, error, updateFilters } = useMarketAnalysis(initialFilters, initialSnapshot);
  const [draft, setDraft] = useState(() => toDraft(initialFilters));
  const [filterError, setFilterError] = useState("");

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numbers = Object.fromEntries(Object.entries(draft).map(([key, value]) => [
      key,
      value.trim() === "" ? undefined : Number(value),
    ]));
    const parsed = marketFilterSchema.safeParse({ ...numbers, sortBy: filters.sortBy, direction: filters.direction });
    if (!parsed.success) {
      setFilterError(parsed.error.issues[0]?.message ?? "Check the selected filter ranges.");
      return;
    }
    setFilterError("");
    void updateFilters(parsed.data);
  }

  function clearFilters() {
    setDraft(toDraft(defaultMarketFilters));
    setFilterError("");
    void updateFilters(defaultMarketFilters);
  }

  function toggleSort(sortBy: MarketFilters["sortBy"]) {
    const direction = filters.sortBy === sortBy && filters.direction === "asc" ? "desc" : "asc";
    void updateFilters({ ...filters, sortBy, direction });
  }

  function downloadCsv() {
    const file = new Blob([exportPropertiesCsv(snapshot.properties.properties)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "market-analysis-sample.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const summary = snapshot.summary;
  const properties = snapshot.properties.properties;

  return (
    <div className="page-wrap market-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">PROPERTY DESK <span className="eyebrow-slash">/</span> 04</p>
          <h1>Market analysis</h1>
        </div>
        <span className="page-index">04 <span>/</span> 04</span>
      </div>

      <div className="market-context">
        <span className="sample-indicator" aria-hidden="true" />
        <p><strong>Supplied sample data</strong><span>Descriptive statistics only. Not a market valuation.</span></p>
        <div className="market-actions">
          <button className="button button-quiet" type="button" onClick={downloadCsv} disabled={properties.length === 0}>
            <Download size={15} aria-hidden="true" /> CSV
          </button>
          <button className="button button-quiet" type="button" onClick={() => window.print()}>
            <Printer size={15} aria-hidden="true" /> PDF
          </button>
        </div>
      </div>

      <form className="market-filters analysis-panel" onSubmit={applyFilters} aria-label="Filter the housing sample">
        <div className="filter-heading">
          <div>
            <p className="eyebrow">SEGMENT FILTERS</p>
            <h2>Refine sample</h2>
          </div>
          <button className="button button-quiet" type="button" onClick={clearFilters}>Reset</button>
        </div>
        <div className="filter-grid">
          <FilterInput label="Min area" name="minSquareFootage" value={draft.minSquareFootage} min="0.01" onChange={(value) => setDraft((current) => ({ ...current, minSquareFootage: value }))} />
          <FilterInput label="Max area" name="maxSquareFootage" value={draft.maxSquareFootage} min="0.01" onChange={(value) => setDraft((current) => ({ ...current, maxSquareFootage: value }))} />
          <FilterInput label="Min bedrooms" name="minBedrooms" value={draft.minBedrooms} min="0" step="1" onChange={(value) => setDraft((current) => ({ ...current, minBedrooms: value }))} />
          <FilterInput label="Max bedrooms" name="maxBedrooms" value={draft.maxBedrooms} min="0" step="1" onChange={(value) => setDraft((current) => ({ ...current, maxBedrooms: value }))} />
          <FilterInput label="Built from" name="minYearBuilt" value={draft.minYearBuilt} min="1800" max="2100" step="1" onChange={(value) => setDraft((current) => ({ ...current, minYearBuilt: value }))} />
          <FilterInput label="Built through" name="maxYearBuilt" value={draft.maxYearBuilt} min="1800" max="2100" step="1" onChange={(value) => setDraft((current) => ({ ...current, maxYearBuilt: value }))} />
        </div>
        {filterError && <p className="form-error" role="alert">{filterError}</p>}
        <div className="filter-footer">
          <p className="privacy-note">Filters describe the available rows; the sample has no date or location fields.</p>
          <button className="button button-primary" type="submit" disabled={isLoading}>Apply filters</button>
        </div>
      </form>

      {error && <p className="form-error market-error" role="alert">{error}</p>}
      <div className="market-results" aria-busy={isLoading}>
        {isLoading && <p className="market-status" role="status">Updating sample analysis…</p>}
        <section className="market-metrics" aria-label="Filtered sample summary">
          <Metric label="Properties in sample" value={formatFeature(summary.sampleSize, 0)} detail="Rows after filters" />
          <Metric label="Mean sample price" value={formatPrice(summary.meanPrice)} detail="Arithmetic mean" />
          <Metric label="Median sample price" value={formatPrice(summary.medianPrice)} detail="Middle observation" />
          <Metric label="Observed price range" value={summary.sampleSize ? `${formatPrice(summary.minPrice)} to ${formatPrice(summary.maxPrice)}` : "—"} detail="Within filtered rows" />
        </section>

        <MarketCharts properties={properties} />

        <WhatIfForm />

        <section className="analysis-panel market-table-panel" aria-labelledby="sample-table-title">
          <div className="section-heading market-table-heading">
            <div>
              <p className="eyebrow">SOURCE ROWS</p>
              <h2 id="sample-table-title">Housing sample</h2>
            </div>
            <span className="table-count" aria-live="polite">{properties.length} of {snapshot.properties.totalElements} rows</span>
          </div>
          {properties.length === 0 ? (
            <div className="empty-state market-empty">No rows match these filters. Adjust the ranges to see the sample.</div>
          ) : (
            <div className="table-scroll market-table-scroll">
              <table className="data-table market-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <SortableHeader label="Price" field="price" filters={filters} onSort={toggleSort} />
                    <SortableHeader label="Area" field="squareFootage" filters={filters} onSort={toggleSort} />
                    <SortableHeader label="Beds" field="bedrooms" filters={filters} onSort={toggleSort} />
                    <th scope="col">Baths</th>
                    <SortableHeader label="Year built" field="yearBuilt" filters={filters} onSort={toggleSort} />
                    <th scope="col">Lot size</th>
                    <th scope="col">Distance</th>
                    <th scope="col">School rating</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <th scope="row">{property.id}</th>
                      <td className="price-cell">{formatPrice(property.price)}</td>
                      <td>{formatFeature(property.square_footage, 0)}</td>
                      <td>{property.bedrooms}</td>
                      <td>{formatFeature(property.bathrooms)}</td>
                      <td>{property.year_built}</td>
                      <td>{formatFeature(property.lot_size, 0)}</td>
                      <td>{formatFeature(property.distance_to_city_center)}</td>
                      <td>{formatFeature(property.school_rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterInput({
  label, name, value, min, max, step = "any", onChange,
}: {
  label: string;
  name: keyof FilterDraft;
  value: string;
  min: string;
  max?: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  const id = `market-filter-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="market-metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function SortableHeader({
  label, field, filters, onSort,
}: {
  label: string;
  field: MarketFilters["sortBy"];
  filters: MarketFilters;
  onSort: (field: MarketFilters["sortBy"]) => void;
}) {
  const active = filters.sortBy === field;
  const SortIcon = !active ? ArrowUpDown : filters.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? filters.direction === "asc" ? "ascending" : "descending" : "none"}>
      <button className="sort-button" type="button" onClick={() => onSort(field)}>
        {label}<SortIcon size={13} aria-hidden="true" />
      </button>
    </th>
  );
}