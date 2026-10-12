import { z } from "zod";

export const marketFilterSchema = z.object({
  minSquareFootage: z.number().positive().optional(),
  maxSquareFootage: z.number().positive().optional(),
  minBedrooms: z.number().int().min(0).optional(),
  maxBedrooms: z.number().int().min(0).optional(),
  minYearBuilt: z.number().int().min(1800).max(2100).optional(),
  maxYearBuilt: z.number().int().min(1800).max(2100).optional(),
  sortBy: z.enum(["price", "squareFootage", "bedrooms", "yearBuilt"]).default("price"),
  direction: z.enum(["asc", "desc"]).default("asc"),
}).superRefine((filters, context) => {
  for (const [minimum, maximum, label] of [
    [filters.minSquareFootage, filters.maxSquareFootage, "Square footage"],
    [filters.minBedrooms, filters.maxBedrooms, "Bedrooms"],
    [filters.minYearBuilt, filters.maxYearBuilt, "Year built"],
  ] as const) {
    if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
      context.addIssue({ code: "custom", message: `${label} minimum cannot exceed maximum.` });
    }
  }
});

export const housingRecordSchema = z.object({
  id: z.number().int().positive(),
  square_footage: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  year_built: z.number().int().min(1800).max(2100),
  lot_size: z.number().positive(),
  distance_to_city_center: z.number().min(0),
  school_rating: z.number().min(0).max(10),
  price: z.number().positive(),
}).strict();

export const marketSnapshotSchema = z.object({
  summary: z.object({
    sampleSize: z.number().int().min(0),
    meanPrice: z.number(),
    medianPrice: z.number(),
    minPrice: z.number(),
    maxPrice: z.number(),
    averageSquareFootage: z.number(),
    averageBedrooms: z.number(),
  }).strict(),
  properties: z.object({
    properties: z.array(housingRecordSchema),
    page: z.number().int().min(0),
    size: z.number().int().positive(),
    totalElements: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }).strict(),
}).strict();

export const whatIfResponseSchema = z.object({ predicted_price: z.number().finite() }).strict();

export type MarketFilters = z.output<typeof marketFilterSchema>;
export type HousingRecord = z.infer<typeof housingRecordSchema>;
export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>;

export const defaultMarketFilters = marketFilterSchema.parse({});

const numericFilterKeys = [
  "minSquareFootage",
  "maxSquareFootage",
  "minBedrooms",
  "maxBedrooms",
  "minYearBuilt",
  "maxYearBuilt",
] as const;

export function parseMarketFilters(search: URLSearchParams): MarketFilters {
  const raw: Record<string, number | string | undefined> = {
    sortBy: search.get("sortBy") ?? undefined,
    direction: search.get("direction") ?? undefined,
  };
  for (const key of numericFilterKeys) {
    const value = search.get(key);
    raw[key] = value === null || value.trim() === "" ? undefined : Number(value);
  }
  const result = marketFilterSchema.safeParse(raw);
  return result.success ? result.data : defaultMarketFilters;
}

export function marketQuery(filters: MarketFilters): URLSearchParams {
  const query = new URLSearchParams({ sortBy: filters.sortBy, direction: filters.direction });
  for (const key of numericFilterKeys) {
    const value = filters[key];
    if (value !== undefined) query.set(key, String(value));
  }
  return query;
}

export function exportPropertiesCsv(properties: HousingRecord[]): string {
  const columns: (keyof HousingRecord)[] = [
    "id", "square_footage", "bedrooms", "bathrooms", "year_built", "lot_size",
    "distance_to_city_center", "school_rating", "price",
  ];
  const rows = [columns.join(","), ...properties.map((property) =>
    columns.map((column) => `"${String(property[column]).replaceAll('"', '""')}"`).join(","),
  )];
  return `${rows.join("\r\n")}\r\n`;
}