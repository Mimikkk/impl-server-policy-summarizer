import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type z from "zod";
import type { Context } from "../clients/HonoClient.ts";
import {
  badRequestResponse,
  internalServerErrorResponse,
  routeNotFoundResponse,
  timeoutResponse,
} from "./messages/responses.ts";

export const withRouteNotFoundErrors: NotFoundHandler = (context) => {
  return context.json(routeNotFoundResponse, routeNotFoundResponse.status);
};

export const withInternalServerErrors: ErrorHandler = (error, context) => {
  if (error instanceof HTTPException && (error.status === 408 || error.status === 504)) {
    return context.json(timeoutResponse, timeoutResponse.status);
  }

  context.var.logger.error(`[InternalServerError] [error] ${error}`);
  return context.json(internalServerErrorResponse, internalServerErrorResponse.status);
};

export const withValidationErrors = <T>(result: z.ZodSafeParseResult<T>, context: Context) => {
  if (result.success) return;
  return context.json(badRequestResponse, badRequestResponse.status);
};
