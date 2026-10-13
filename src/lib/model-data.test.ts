import { describe, expect, it } from "vitest";

import { datasetResponseSchema, modelMetricsSchema } from "@/lib/model-data";

describe("model data contracts", () => {
  it("accepts dataset responses whose count matches the rows", () => {
    const house = {
      id: 1,
      square_footage: 1550,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 1997,
      lot_size: 6800,
      distance_to_city_center: 4.1,
      school_rating: 7.6,
      price: 325000,
    };

    expect(datasetResponseSchema.safeParse({ houses: [house], count: 1 }).success).toBe(true);
    expect(datasetResponseSchema.safeParse({ houses: [house], count: 2 }).success).toBe(false);
  });

  it("rejects non-finite model metrics", () => {
    expect(modelMetricsSchema.safeParse({
      r2_score: Number.NaN,
      mae: 1,
      rmse: 1,
      train_samples: 8,
      test_samples: 2,
      trained_at: "2026-01-01T00:00:00Z",
    }).success).toBe(false);
  });
});