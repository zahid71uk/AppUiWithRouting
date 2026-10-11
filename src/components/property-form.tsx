"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useEstimates } from "@/hooks/use-estimates";
import { propertyFormSchema, propertySchema, type PropertyInput } from "@/lib/property";

const fields = [
  { name: "square_footage", label: "Interior area", unit: "sq ft", min: "0", step: "any" },
  { name: "bedrooms", label: "Bedrooms", unit: "rooms", min: "0", step: "1" },
  { name: "bathrooms", label: "Bathrooms", unit: "rooms", min: "0", step: "any" },
  { name: "year_built", label: "Year built", unit: "year", min: "1800", max: "2100", step: "1" },
  { name: "lot_size", label: "Lot size", unit: "sq ft", min: "0", step: "any" },
  { name: "distance_to_city_center", label: "Distance to center", unit: "miles", min: "0", step: "any" },
  { name: "school_rating", label: "School rating", unit: "out of 10", min: "0", max: "10", step: "any" },
] as const;

type FormValues = z.input<typeof propertyFormSchema>;
type ParsedFormValues = z.output<typeof propertyFormSchema>;
type PropertyField = keyof z.input<typeof propertySchema>;

export function PropertyForm() {
  const { addEstimate } = useEstimates();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, ParsedFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      label: "",
      square_footage: "",
      bedrooms: "",
      bathrooms: "",
      year_built: "",
      lot_size: "",
      distance_to_city_center: "",
      school_rating: "",
    },
  });

  const onSubmit = async (values: ParsedFormValues) => {
    setApiError(null);
    const { label, ...features } = values;
    const property: PropertyInput = features;

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ house: property }),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const responseMessage =
          typeof body === "object" && body !== null && "detail" in body &&
          typeof body.detail === "string"
            ? body.detail
            : typeof body === "object" && body !== null && "message" in body &&
              typeof body.message === "string"
              ? body.message
              : "The estimate could not be completed. Please try again.";
        const validationErrors =
          typeof body === "object" && body !== null && "errors" in body &&
          Array.isArray(body.errors)
            ? body.errors
                .filter(
                  (item): item is { field: string; message: string } =>
                    typeof item === "object" && item !== null &&
                    "field" in item && typeof item.field === "string" &&
                    "message" in item && typeof item.message === "string",
                )
                .map((item) => `${item.field}: ${item.message}`)
                .join(" ")
            : "";
        const message = validationErrors || responseMessage;
        setApiError(message);
        return;
      }

      const result = z.object({ predicted_price: z.number().finite() }).safeParse(body);
      if (!result.success) {
        setApiError("The estimate service returned an unexpected response.");
        return;
      }

      addEstimate({
        label: label?.trim() || `Property ${new Date().toLocaleDateString()}`,
        property,
        predictedPrice: result.data.predicted_price,
      });
      reset();
    } catch {
      setApiError("The estimate service is unavailable. Check the connection and try again.");
    }
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-heading">
        <div>
          <p className="eyebrow">PROPERTY DETAILS</p>
          <h2>Build a profile</h2>
        </div>
        <span className="required-note"><span aria-hidden="true">*</span> Required</span>
      </div>

      <div className="field-grid grid grid-cols-2 gap-x-4 gap-y-[18px]">
        <div className="field field-wide">
          <label htmlFor="property-label">Property label <span className="optional-note">Optional</span></label>
          <input id="property-label" placeholder="e.g. Cedar Street" autoComplete="off" {...register("label")} />
          {errors.label && <p className="field-error">{errors.label.message}</p>}
        </div>

        {fields.map((field) => {
          const key = field.name as PropertyField;
          const error = errors[key];
          return (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}<span className="required-star" aria-hidden="true">*</span></label>
              <div className={`input-wrap${error ? " input-invalid" : ""}`}>
                <input
                  id={field.name}
                  type="number"
                  inputMode="decimal"
                  required
                  min={field.min}
                  max={"max" in field ? field.max : undefined}
                  step={field.step}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${field.name}-error` : `${field.name}-unit`}
                  {...register(field.name)}
                />
                <span id={`${field.name}-unit`} className="input-unit">{field.unit}</span>
              </div>
              {error && (
                <p className="field-error" id={`${field.name}-error`} role="alert">
                  {error.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {apiError && <p className="form-error" role="alert">{apiError}</p>}

      <div className="form-footer">
        <p className="privacy-note">Estimates are based on the supplied property features.</p>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
          <span>{isSubmitting ? "Estimating" : "Get estimate"}</span>
        </button>
      </div>
    </form>
  );
}