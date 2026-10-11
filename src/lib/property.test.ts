import { describe, expect, it } from "vitest";

import { estimateRecordSchema, propertyFormSchema, propertySchema } from "@/lib/property";

const validForm = {
  square_footage: "1550",
  bedrooms: "3",
  bathrooms: "2",
  year_built: "1997",
  lot_size: "6800",
  distance_to_city_center: "4.1",
  school_rating: "7.6",
};

describe("property validation", () => {
  it("rejects blank mandatory fields", () => {
    const result = propertyFormSchema.safeParse({ ...validForm, school_rating: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe("School rating is required.");
  });

  it("requires every field and transforms form strings into numeric API data", () => {
    const result = propertyFormSchema.safeParse(validForm);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.square_footage).toBe(1550);
      expect(result.data.bedrooms).toBe(3);
      expect(typeof result.data.school_rating).toBe("number");
      expect(propertySchema.safeParse(result.data).success).toBe(true);
    }
  });

  it.each([
    ["square_footage", "0"],
    ["bedrooms", "2.5"],
    ["year_built", "1799"],
    ["year_built", "2101"],
    ["lot_size", "0"],
    ["distance_to_city_center", "-1"],
    ["school_rating", "10.1"],
  ])("rejects invalid %s", (field, value) => {
    const result = propertyFormSchema.safeParse({ ...validForm, [field]: value });
    expect(result.success).toBe(false);
  });

  it("accepts numeric values restored from local history", () => {
    const result = estimateRecordSchema.safeParse({
      id: "entry-1",
      label: "Cedar Street",
      property: {
        square_footage: 1550,
        bedrooms: 3,
        bathrooms: 2,
        year_built: 1997,
        lot_size: 6800,
        distance_to_city_center: 4.1,
        school_rating: 7.6,
      },
      predictedPrice: 325000,
      createdAt: "2026-10-11T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});