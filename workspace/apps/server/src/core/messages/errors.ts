import { z } from "@hono/zod-openapi";
import type { ErrorHandler, NotFoundHandler } from "hono";

export const BadRequest = { error: "Bad request", status: 400 } as const;
export const BadRequestResponseSchema = z.object({
  error: z.literal("Bad request").describe("The error message of the response."),
  status: z.literal(400).describe("The status code of the response."),
}).openapi(
  "BadRequest",
  { example: BadRequest },
);

export const NotFound = { error: "Not found", status: 404 } as const;
export const NotFoundResponseSchema = z.object({
  error: z.literal("Not found").describe("The error message of the response."),
  status: z.literal(404).describe("The status code of the response."),
}).openapi(
  "NotFound",
  { example: NotFound },
);

export const InternalServerError = { error: "Internal server error", status: 500 } as const;
export const InternalServerErrorResponseSchema = z.object({
  error: z.literal("Internal server error").describe("The error message of the response."),
  status: z.literal(500).describe("The status code of the response."),
}).openapi(
  "InternalServerError",
);

export const Responses = {
  400: {
    content: { "application/json": { schema: BadRequestResponseSchema } },
    description: "Bad request",
  },
  404: {
    content: { "application/json": { schema: NotFoundResponseSchema } },
    description: "Not found",
  },
  500: {
    content: { "application/json": { schema: InternalServerErrorResponseSchema } },
    description: "Internal server error",
  },
} satisfies Record<
  number,
  { content: { "application/json": { schema: z.ZodObject<any, any> } }; description: string }
>;

type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A ? A[K] : K extends keyof B ? B[K] : never;
};

type Response<T extends z.ZodObject<any, any>> = { schema: T; description: string; example?: z.infer<T> };

type ResponsesResult<R extends Record<number, Response<z.ZodObject<any, any>>>> = Merge<
  {
    [K in Exclude<keyof R, string | symbol>]: {
      content: { "application/json": { schema: R[K]["schema"] } };
      description: R[K]["description"];
    };
  },
  typeof Responses
>;

export const responses = <const R extends Record<number, Response<z.ZodObject<any, any>>>>(
  record: R,
): ResponsesResult<R> =>
  ({
    ...Responses,
    ...Object.fromEntries(
      Object.entries(record).map((
        [key, { schema, description, example }],
      ) => [key, { content: { "application/json": { schema, example } }, description }]),
    ),
  }) as ResponsesResult<R>;

export const notFoundErrors: NotFoundHandler = (context) => {
  return context.json(NotFound, NotFound.status);
};

export const internalServerErrors: ErrorHandler = (error, context) => {
  context.var.logger.error(`[internalServerError] [error] ${error}`);
  return context.json(InternalServerError, InternalServerError.status);
};
