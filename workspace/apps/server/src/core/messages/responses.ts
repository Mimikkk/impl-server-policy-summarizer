import { z } from "@hono/zod-openapi";

interface ResponseResponseOptions<TStatus extends number, TName extends string> {
  status: TStatus;
  name: TName;
  example: { message: string; status: TStatus };
}

const ResponseSchema = <const TStatus extends number, const TName extends string>(
  { status, name, example }: ResponseResponseOptions<TStatus, TName>,
): z.ZodObject<{ message: z.ZodString; status: z.ZodLiteral<TStatus> }> =>
  z.object({
    message: z.string().describe("The error message of the response."),
    status: z.literal(status).describe("The status code of the response."),
  }).openapi(name, { example });

export const badRequestResponse = {
  status: 400,
  message: "bad request",
} as const;
export const BadRequestResponseSchema = ResponseSchema({
  status: 400,
  name: "Core / Errors / BadRequestErrorResponse",
  example: badRequestResponse,
});
export type BadRequestResponse = z.infer<typeof BadRequestResponseSchema>;

export const routeNotFoundResponse = {
  status: 404,
  message: "Route not found",
} as const;
export const RouteNotFoundResponseSchema = ResponseSchema({
  status: 404,
  name: "Core / Errors / RouteNotFoundErrorResponse",
  example: routeNotFoundResponse,
});
export type RouteNotFoundResponse = z.infer<typeof RouteNotFoundResponseSchema>;

export const internalServerErrorResponse = {
  status: 500,
  message: "Internal server error",
} as const;
export const InternalServerErrorResponseSchema = ResponseSchema({
  status: 500,
  name: "Core / Errors / InternalServerErrorResponse",
  example: internalServerErrorResponse,
});
export type InternalServerErrorResponse = z.infer<typeof InternalServerErrorResponseSchema>;

export const TimeoutError = new Error("Request took too much time");
export const timeoutResponse = {
  status: 408,
  message: "Request took too much time",
} as const;
export const TimeoutResponseSchema = ResponseSchema({
  status: 408,
  name: "Core / Errors / TimeoutErrorResponse",
  example: timeoutResponse,
});
export type TimeoutResponse = z.infer<typeof TimeoutResponseSchema>;
