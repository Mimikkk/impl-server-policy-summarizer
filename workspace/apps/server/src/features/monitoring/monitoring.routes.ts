import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";

const MetricsSchema = z.object({
  cacheHitCount: z.number().describe("Number of cache hits"),
  cacheMissCount: z.number().describe("Number of cache misses"),
  cacheTotal: z.number().describe("Total cache requests"),
  cacheHitRatio: z.number().describe("Cache hit ratio (0-1)"),
  cacheMissRatio: z.number().describe("Cache miss ratio (0-1)"),

  successCount: z.number().describe("Number of successful requests"),
  failureCount: z.number().describe("Number of failed requests"),
  total: z.number().describe("Total number of requests"),

  avgTimeMs: z.number().describe("Average response time in milliseconds"),
  timesMs: z.array(z.number()).describe("Recent response times in milliseconds"),
});

const GlobalMetricsSchema = MetricsSchema.extend({
  uptime: z.number().describe("Server uptime in milliseconds"),
  timestamp: z.number().describe("Current timestamp"),
});

const EndpointMetricsSchema = MetricsSchema.extend({
  lastAccessed: z.number().describe("Last access timestamp"),
});

const MonitoringDataSchema = z.object({
  global: GlobalMetricsSchema,
  endpoints: z.record(z.string(), EndpointMetricsSchema).describe("Metrics per endpoint"),
});

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/metrics",
    tags: ["Monitoring"],
    summary: "Get comprehensive monitoring metrics",
    description: "Returns global metrics and per-endpoint statistics",
    responses: defineResponses({
      200: {
        schema: MonitoringDataSchema,
        description: "Comprehensive monitoring metrics",
        example: {
          global: {
            cacheHitCount: 150,
            cacheMissCount: 50,
            cacheTotal: 200,
            cacheHitRatio: 0.75,
            cacheMissRatio: 0.25,
            total: 1000,
            successCount: 950,
            failureCount: 50,
            avgTimeMs: 250.5,
            timesMs: [200, 300, 150, 400],
            uptime: 3600000,
            timestamp: 1703123456789,
          },
          endpoints: {
            "GET:/api/v1/summarize": {
              cacheHitCount: 50,
              cacheMissCount: 20,
              cacheTotal: 70,
              cacheHitRatio: 0.714,
              cacheMissRatio: 0.286,
              total: 500,
              successCount: 480,
              failureCount: 20,
              avgTimeMs: 300.2,
              timesMs: [250, 350, 200],
              lastAccessed: 1703123456789,
            },
          },
        },
      },
    }),
  },
  (context) => context.json(context.var.monitoring.getMonitoringData(), 200),
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
        example: {
          cacheHitCount: 150,
          cacheMissCount: 50,
          cacheTotal: 200,
          cacheHitRatio: 0.75,
          cacheMissRatio: 0.25,
          successCount: 950,
          failureCount: 50,
          total: 1000,
          avgTimeMs: 250.5,
          timesMs: [200, 300, 150, 400],
          uptime: 3600000,
          timestamp: 1703123456789,
        },
      },
    }),
  },
  (context) => context.json(context.var.monitoring.calculateGlobalMetrics(), 200),
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
        example: {
          cacheHitCount: 50,
          cacheMissCount: 20,
          cacheTotal: 70,
          cacheHitRatio: 0.714,
          cacheMissRatio: 0.286,
          total: 500,
          successCount: 480,
          failureCount: 20,
          avgTimeMs: 300.2,
          timesMs: [250, 350, 200],
          lastAccessed: 1703123456789,
        },
      },
      404: {
        schema: z.object({
          error: z.string().describe("Error message"),
        }),
        description: "Endpoint not found",
        example: {
          error: "Endpoint not found",
        },
      },
    }),
  },
  (context) => {
    const { monitoring } = context.var;
    const { endpoint } = context.req.valid("param");

    const endpointMetrics = monitoring.getEndpointMetrics(endpoint);
    if (!endpointMetrics) {
      return context.json({ error: "Endpoint not found" }, 404);
    }

    return context.json(endpointMetrics, 200);
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
        example: {
          "GET:/api/v1/summarize": {
            cacheHitCount: 50,
            cacheMissCount: 20,
            cacheTotal: 70,
            cacheHitRatio: 0.714,
            cacheMissRatio: 0.286,
            total: 500,
            successCount: 480,
            failureCount: 20,
            avgTimeMs: 300.2,
            timesMs: [250, 350, 200],
            lastAccessed: 1703123456789,
          },
          "GET:/api/v1/health": {
            cacheHitCount: 100,
            cacheMissCount: 30,
            cacheTotal: 130,
            cacheHitRatio: 0.769,
            cacheMissRatio: 0.231,
            total: 500,
            successCount: 500,
            failureCount: 0,
            avgTimeMs: 50.1,
            timesMs: [45, 55, 50],
            lastAccessed: 1703123456789,
          },
        },
      },
    }),
  },
  (context) => {
    const { monitoring } = context.var;
    const endpointsMetrics = monitoring.getAllEndpointMetrics();
    return context.json(endpointsMetrics, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/metrics/reset",
    tags: ["Monitoring"],
    summary: "Reset all monitoring metrics",
    description: "Resets all counters and statistics to zero",
    responses: defineResponses({
      200: {
        schema: z.object({
          message: z.string().describe("Success message"),
          timestamp: z.number().describe("Reset timestamp"),
        }),
        description: "Metrics reset confirmation",
        example: {
          message: "All metrics have been reset successfully",
          timestamp: 1703123456789,
        },
      },
    }),
  },
  (context) => {
    const { monitoring } = context.var;
    monitoring.reset();

    return context.json({ message: "All metrics have been reset successfully", timestamp: Date.now() }, 200);
  },
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
          uptime: z.number().describe("Server uptime in milliseconds"),
          timestamp: z.number().describe("Current timestamp"),
        }),
        description: "Health status information",
        example: { status: "healthy", uptime: 3600000, timestamp: 1703123456789 },
      },
    }),
  },
  (context) => {
    const { uptime, timestamp } = context.var.monitoring.calculateGlobalMetrics();

    return context.json({ status: "healthy", uptime, timestamp }, 200);
  },
);
