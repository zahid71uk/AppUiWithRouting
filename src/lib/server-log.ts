import "server-only";

type LogContext = {
  statusCode?: number;
};

export function logServerError(event: string, error: unknown, context: LogContext = {}): void {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    service: "property-desk",
    event,
    errorType: error instanceof Error ? error.name : "UnknownError",
    ...context,
  }));
}