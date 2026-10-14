import "server-only";

import { datasetResponseSchema, modelHealthSchema, modelMetricsSchema } from "@/lib/model-data";
import { logServerError } from "@/lib/server-log";
import type { ModelDataSnapshot } from "@/lib/model-data";

export class ModelDataApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function getModelDataSnapshot(): Promise<ModelDataSnapshot> {
  const baseUrl = (process.env.PRICE_PREDICTION_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
  try {
    const [datasetResponse, healthResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/dataset/houses`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      }),
      fetch(`${baseUrl}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      }),
    ]);
    if (!datasetResponse.ok || !healthResponse.ok) {
      throw new ModelDataApiError("Price prediction service returned an error.", 502);
    }

    const [datasetBody, healthBody] = await Promise.all([
      datasetResponse.json(),
      healthResponse.json(),
    ]);
    const dataset = datasetResponseSchema.safeParse(datasetBody);
    const health = modelHealthSchema.safeParse(healthBody);
    if (!dataset.success || !health.success) {
      throw new ModelDataApiError("Price prediction service returned invalid data.", 502);
    }

    if (!health.data.model_loaded) {
      return { houses: [], metrics: null, modelLoaded: false };
    }

    const metricsResponse = await fetch(`${baseUrl}/model/metrics`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!metricsResponse.ok) {
      throw new ModelDataApiError("Model metrics are unavailable.", 502);
    }
    const metrics = modelMetricsSchema.safeParse(await metricsResponse.json());
    if (!metrics.success) {
      throw new ModelDataApiError("Price prediction service returned invalid model metrics.", 502);
    }

    return { houses: dataset.data.houses, metrics: metrics.data, modelLoaded: true };
  } catch (error) {
    if (error instanceof ModelDataApiError) {
      logServerError("model-data.upstream-failure", error, { statusCode: error.status });
      throw error;
    }
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logServerError("model-data.fetch-failed", error, { statusCode: timedOut ? 504 : 503 });
    throw new ModelDataApiError(
      timedOut ? "Price prediction service timed out." : "Price prediction service is unavailable.",
      timedOut ? 504 : 503,
    );
  }
}