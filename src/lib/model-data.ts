import { z } from "zod";

export const datasetHouseSchema = z.object({
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

export const datasetResponseSchema = z.object({
  houses: z.array(datasetHouseSchema),
  count: z.number().int().min(0),
}).strict().refine((dataset) => dataset.count === dataset.houses.length);

export const modelMetricsSchema = z.object({
  r2_score: z.number().finite(),
  mae: z.number().finite().min(0),
  rmse: z.number().finite().min(0),
  train_samples: z.number().int().positive(),
  test_samples: z.number().int().positive(),
  trained_at: z.string().datetime({ offset: true }),
}).strict();

export const modelHealthSchema = z.object({
  status: z.string(),
  model_loaded: z.boolean(),
}).strict();

export const datasetTrainingResponseSchema = z.object({
  dataset_count: z.number().int().positive(),
  metrics: modelMetricsSchema,
  market_analysis_cache_refreshed: z.boolean(),
  message: z.string(),
}).strict();

export type DatasetHouse = z.infer<typeof datasetHouseSchema>;
export type ModelMetrics = z.infer<typeof modelMetricsSchema>;
export type ModelDataSnapshot = {
  houses: DatasetHouse[];
  metrics: ModelMetrics | null;
  modelLoaded: boolean;
};