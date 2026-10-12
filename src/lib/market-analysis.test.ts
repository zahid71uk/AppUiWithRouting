import { describe, expect, it } from "vitest";

import { exportPropertiesCsv, parseMarketFilters } from "@/lib/market-analysis";

describe("market analysis helpers", () => {
  it("parses valid filter query parameters", () => {
    const filters = parseMarketFilters(new URLSearchParams("minBedrooms=3&minYearBuilt=1990&direction=desc"));

    expect(filters).toMatchObject({ minBedrooms: 3, minYearBuilt: 1990, direction: "desc" });
  });

  it("falls back to defaults for invalid filter ranges", () => {
    const filters = parseMarketFilters(new URLSearchParams("minBedrooms=5&maxBedrooms=2"));

    expect(filters.minBedrooms).toBeUndefined();
    expect(filters.maxBedrooms).toBeUndefined();
  });

  it("exports quoted CSV headers and values", () => {
    const csv = exportPropertiesCsv([{
      id: 1,
      square_footage: 1250,
      bedrooms: 2,
      bathrooms: 1,
      year_built: 1985,
      lot_size: 5200,
      distance_to_city_center: 3.2,
      school_rating: 7.1,
      price: 185000,
    }]);

    expect(csv).toContain("id,square_footage,bedrooms");
    expect(csv).toContain('"1","1250","2"');
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});