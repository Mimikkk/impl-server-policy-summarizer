import { type Container, container } from "@configs/container.ts";
import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type z from "zod";
import type { Context } from "../clients/HonoClient.ts";
import {
  badRequestResponse,
  internalServerErrorResponse,
  routeNotFoundResponse,
  timeoutResponse,
} from "./messages/responses.ts";

export const withContainer: MiddlewareHandler<{ Variables: Container }> = async (context, next) => {
  for (const name in container) {
    const key = name as keyof Container;
    context.set(key, container[key]);
  }

  await next();
};

export const withRequestMonitor: MiddlewareHandler<{ Variables: Container }> = async (context, next) => {
  const { metrics: monitoring } = context.var;
  const key = `${context.req.method}:${context.req.url.split("?")[0]}`;

  const startTimeMs = Date.now();
  try {
    await next();
    const responseTimeMs = Date.now() - startTimeMs;

    const isSuccess = context.res.status >= 200 && context.res.status < 400;
    monitoring.recordRequest(key, isSuccess, responseTimeMs);
  } catch (error) {
    const responseTimeMs = Date.now() - startTimeMs;
    monitoring.recordRequest(key, false, responseTimeMs);
    throw error;
  }
};

export const withCacheMonitor: MiddlewareHandler<{ Variables: Container }> = async (context, next) => {
  const key = `${context.req.method}:${context.req.url.split("?")[0]}`;

  await next();

  const cacheControl = context.res.headers.get("cache-control");
  const etag = context.res.headers.get("etag");
  const age = context.res.headers.get("age");

  const isSuccess = cacheControl || etag || age;
  context.var.metrics.recordCache(key, !!isSuccess);
};

export const withRouteNotFoundErrors: NotFoundHandler = (context) => {
  return context.json(routeNotFoundResponse, routeNotFoundResponse.status);
};

export const withInternalServerErrors: ErrorHandler = (error, context) => {
  if (error instanceof HTTPException && (error.status === 408 || error.status === 504)) {
    return context.json(timeoutResponse, timeoutResponse.status);
  }

  context.var.logger.error({ error }, `[InternalServerError] [error] ${error.message}`);
  return context.json(internalServerErrorResponse, internalServerErrorResponse.status);
};

export const withValidationErrors = <T>(result: z.ZodSafeParseResult<T>, context: Context) => {
  if (result.success) return;
  return context.json(badRequestResponse, badRequestResponse.status);
};
