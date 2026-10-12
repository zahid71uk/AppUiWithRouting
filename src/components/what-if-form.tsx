"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { propertySchema, type PropertyInput } from "@/lib/property";
import { formatPrice } from "@/lib/format";
import { whatIfResponseSchema } from "@/lib/market-analysis";

const initialValues: Record<keyof PropertyInput, string> = {
  square_footage: "1600",
  bedrooms: "3",
  bathrooms: "2",
  year_built: "2000",
  lot_size: "7000",
  distance_to_city_center: "4",
  school_rating: "7",
};

const fields: { key: keyof PropertyInput; label: string; min: number; max?: number; step: number }[] = [
  { key: "square_footage", label: "Square footage", min: 0.01, step: 1 },
  { key: "bedrooms", label: "Bedrooms", min: 0, step: 1 },
  { key: "bathrooms", label: "Bathrooms", min: 0, step: 0.5 },
  { key: "year_built", label: "Year built", min: 1800, max: 2100, step: 1 },
  { key: "lot_size", label: "Lot size", min: 0.01, step: 1 },
  { key: "distance_to_city_center", label: "Distance to city center", min: 0, step: 0.1 },
  { key: "school_rating", label: "School rating", min: 0, max: 10, step: 0.1 },
];

export function WhatIfForm() {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrediction(null);
    setError("");
    const missing = fields.filter(({ key }) => values[key].trim() === "");
    if (missing.length > 0) {
      setFieldErrors(Object.fromEntries(missing.map(({ key }) => [key, "This field is required."])));
      return;
    }
    const parsed = propertySchema.safeParse(Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ));
    if (!parsed.success) {
      setFieldErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/market-analysis/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "message" in body
          ? String(body.message)
          : "The estimate could not be completed.";
        throw new Error(message);
      }
      const result = whatIfResponseSchema.safeParse(body);
      if (!result.success) throw new Error("The estimate service returned invalid data.");
      setPrediction(result.data.predicted_price);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The estimate could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="analysis-panel what-if-panel" aria-labelledby="what-if-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MODEL SCENARIO</p>
          <h2 id="what-if-title">What if?</h2>
        </div>
        <span className="model-note">Model estimate</span>
      </div>
      <form className="what-if-form" onSubmit={submit} noValidate>
        <div className="what-if-fields">
          {fields.map(({ key, label, min, max, step }) => {
            const errorId = `what-if-${key}-error`;
            return (
              <div className="field" key={key}>
                <label htmlFor={`what-if-${key}`}>{label}</label>
                <input
                  id={`what-if-${key}`}
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  required
                  value={values[key]}
                  aria-invalid={Boolean(fieldErrors[key])}
                  aria-describedby={fieldErrors[key] ? errorId : undefined}
                  onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                />
                {fieldErrors[key] && <p className="field-error" id={errorId}>{fieldErrors[key]}</p>}
              </div>
            );
          })}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="what-if-footer">
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
            {isSubmitting ? "Estimating" : "Run scenario"}
          </button>
          <output className="what-if-result" aria-live="polite" aria-atomic="true">
            {prediction === null ? <span>Enter a scenario to see its estimate.</span> : <><small>MODEL PREDICTION</small><strong>{formatPrice(prediction)}</strong></>}
          </output>
        </div>
      </form>
    </section>
  );
}