import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { EndpointMetricsSchema } from "./resources/EndpointMetrics.ts";
import { GlobalMetricsExample, GlobalMetricsSchema } from "./resources/GlobalMetrics.ts";
import { MetricsExample, MetricsSchema } from "./resources/Metrics.ts";

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics",
    tags: ["Monitoring"],
    summary: "Read comprehensive monitoring metrics",
    description: "Returns all available metrics",
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
    summary: "Read global monitoring metrics",
    description: "Returns server-wide statistics and performance metrics",
    responses: defineResponses({
      200: {
        schema: GlobalMetricsSchema,
        description: "Server-wide statistics and performance metrics",
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
    summary: "Read metrics for a specific endpoint",
    description: "Returns performance metrics for a specific endpoint",
    request: {
      params: z.object({
        endpoint: z.string().openapi({
          description: "Endpoint in format method:path (e.g., GET:/api/v1/summarize)",
          example: "GET:/api/v1/summarize",
          title: "method:path",
        }),
      }),
    },
    responses: defineResponses({
      200: {
        schema: EndpointMetricsSchema,
        description: "Performance metrics for a specific endpoint",
      },
      404: {
        schema: z.object({
          error: z.string().openapi({ description: "Endpoint not found" }),
        }).openapi("Monitoring - Errors - EndpointNotFoundErrorResponse"),
        description: "Endpoint not found",
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
    summary: "Check health",
    description: "Check the health of the server",
    responses: defineResponses({
      200: {
        schema: z.object({
          status: z.string().describe("Health status"),
          uptimeMs: z.number().describe("Server uptime in milliseconds"),
          startTs: z.number().describe("Server start timestamp"),
        }).openapi("Monitoring - Results - Health"),
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
