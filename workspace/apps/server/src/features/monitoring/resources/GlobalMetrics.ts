import { z } from "@hono/zod-openapi";

export const GlobalMetricsSchema = z.object({
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
}).openapi("Monitoring / Results / GlobalMetrics", { description: "Global metrics" });

export type GlobalMetrics = z.infer<typeof GlobalMetricsSchema>;

export const GlobalMetricsExample = {
  cacheSuccessCount: 150,
  cacheFailureCount: 50,
  cacheRequestTotal: 200,
  cacheSuccessRatio: 0.75,
  cacheFailureRatio: 0.25,
  successCount: 950,
  failureCount: 50,
  requestCount: 1000,
  timesMs: [200, 300, 150, 400],
  avgTimeMs: 250.5,
} satisfies GlobalMetrics;
