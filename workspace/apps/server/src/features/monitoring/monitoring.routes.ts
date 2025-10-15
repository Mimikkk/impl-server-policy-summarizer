import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { EndpointMetricsExample, EndpointMetricsSchema } from "./resources/EndpointMetrics.ts";
import { GlobalMetricsExample, GlobalMetricsSchema } from "./resources/GlobalMetrics.ts";
import { MetricsExample, MetricsSchema } from "./resources/Metrics.ts";

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics",
    tags: ["Monitoring"],
    summary: "Get comprehensive monitoring metrics",
    description: "Returns global metrics and per-endpoint statistics",
    responses: defineResponses({
      200: {
        schema: MetricsSchema,
        description: "Comprehensive monitoring metrics",
        example: MetricsExample,
      },
    }),
  },
  (context) => context.json(context.var.metrics.calculateMetrics(), 200),
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics/global",
    tags: ["Monitoring"],
    summary: "Get global monitoring metrics",
    description: "Returns server-wide statistics and performance metrics",
    responses: defineResponses({
      200: {
        schema: GlobalMetricsSchema,
        description: "Global monitoring metrics",
        example: GlobalMetricsExample,
      },
    }),
  },
  (context) => context.json(context.var.metrics.calculateGlobalMetrics(), 200),
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics/endpoint/{endpoint}",
    tags: ["Monitoring"],
    summary: "Get metrics for a specific endpoint",
    description: "Returns performance metrics for a specific endpoint (format: METHOD:path)",
    request: {
      params: z.object({
        endpoint: z.string().describe("Endpoint in format METHOD:path (e.g., GET:/api/v1/summarize)"),
      }),
    },
    responses: defineResponses({
      200: {
        schema: EndpointMetricsSchema,
        description: "Endpoint-specific metrics",
        example: EndpointMetricsExample,
      },
      404: {
        schema: z.object({ error: z.string().describe("Error message") }),
        description: "Endpoint not found",
        example: { error: "Endpoint not found" },
      },
    }),
  },
  (context) => {
    const { endpoint } = context.req.valid("param");

    const metrics = context.var.metrics.calculateEndpointMetrics(endpoint);

    if (metrics) {
      return context.json({ error: "Endpoint not found" }, 404);
    }

    return context.json(metrics, 200);
  },
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics/endpoints",
    tags: ["Monitoring"],
    summary: "Get metrics for all endpoints",
    description: "Returns performance metrics for all tracked endpoints",
    responses: defineResponses({
      200: {
        schema: z.record(z.string(), EndpointMetricsSchema),
        description: "All endpoint metrics",
        example: { "GET:/api/v1/summarize": EndpointMetricsExample },
      },
    }),
  },
  (context) => context.json(context.var.metrics.calculateEndpointsMetrics(), 200),
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/health",
    tags: ["Monitoring"],
    summary: "Health check endpoint",
    description: "Returns basic health status and uptime",
    responses: defineResponses({
      200: {
        schema: z.object({
          status: z.string().describe("Health status"),
          uptimeMs: z.number().describe("Server uptime in milliseconds"),
          startTs: z.number().describe("Server start timestamp"),
        }),
        description: "Health status information",
        example: { status: "healthy", uptimeMs: 3600000, startTimeTs: 1703123456789 },
      },
    }),
  },
  (context) => {
    const { startTs, uptimeMs } = context.var.metrics.calculateMetrics();

    return context.json({ status: "healthy", uptimeMs, startTs }, 200);
  },
);
