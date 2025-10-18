import { z } from "@hono/zod-openapi";
import { EndpointMetricsExample, EndpointMetricsSchema } from "../resources/EndpointMetrics.ts";
import { GlobalMetricsExample, GlobalMetricsSchema } from "../resources/GlobalMetrics.ts";

export const MetricsSchema = z.object({
  startTs: z.number().describe("Start timestamp"),
  uptimeMs: z.number().describe("Uptime in milliseconds"),
  global: GlobalMetricsSchema,
  endpoints: z.record(z.string(), EndpointMetricsSchema).describe("Metrics per endpoint"),
}).openapi("Monitoring - Results - Metrics", { description: "Comprehensive monitoring metrics" });

export type Metrics = z.infer<typeof MetricsSchema>;

export const MetricsExample = {
  startTs: 1703123456789,
  uptimeMs: 3600000,
  global: GlobalMetricsExample,
  endpoints: { "GET:/api/v1/summarize": EndpointMetricsExample },
} satisfies Metrics;
