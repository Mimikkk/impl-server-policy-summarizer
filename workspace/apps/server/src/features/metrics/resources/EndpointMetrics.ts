import { z } from "@hono/zod-openapi";

export const EndpointMetricsSchema = z.object({
  cacheSuccessCount: z.number().describe("Number of cache hits"),
  cacheFailureCount: z.number().describe("Number of cache misses"),
  cacheRequestTotal: z.number().describe("Number of cache requests"),
  cacheSuccessRatio: z.number().describe("Cache hit ratio (0-1)"),
  cacheFailureRatio: z.number().describe("Cache miss ratio (0-1)"),
  successCount: z.number().describe("Number of successful requests"),
  failureCount: z.number().describe("Number of failed requests"),
  requestCount: z.number().describe("Number of requests"),
  timesMs: z.array(z.number()).describe("Recent response times in milliseconds"),
  avgTimeMs: z.number().describe("Average response time in milliseconds"),
  lastUsedTs: z.number().describe("Last access timestamp"),
}).openapi("Metrics - Results - EndpointMetrics", { description: "Endpoint-specific metrics" });

export type EndpointMetrics = z.infer<typeof EndpointMetricsSchema>;

export const EndpointMetricsExample = {
  cacheSuccessCount: 50,
  cacheFailureCount: 20,
  cacheRequestTotal: 70,
  cacheSuccessRatio: 0.714,
  cacheFailureRatio: 0.286,
  successCount: 480,
  failureCount: 20,
  requestCount: 500,
  timesMs: [250, 350, 200],
  avgTimeMs: 300.2,
  lastUsedTs: 1703123456789,
} satisfies EndpointMetrics;
