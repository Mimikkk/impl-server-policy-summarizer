import type { z } from "@hono/zod-openapi";
import type { Merge } from "@utilities/types.ts";
import {
  BadRequestResponseSchema,
  InternalServerErrorResponseSchema,
  RouteNotFoundResponseSchema,
  TimeoutResponseSchema,
} from "../../core/messages/responses.ts";

type ResponseOpenApiSchema<
  T extends z.ZodObject<any, any> | z.ZodRecord<any, any> = z.ZodObject<any, any> | z.ZodRecord<any, any>,
> = {
  content: { "application/json": { schema: T } };
  description: string;
};

const GlobalResponses = {
  400: {
    content: { "application/json": { schema: BadRequestResponseSchema } },
    description: "Bad request",
  },
  404: {
    content: { "application/json": { schema: RouteNotFoundResponseSchema } },
    description: "Route Not found",
  },
  408: {
    content: { "application/json": { schema: TimeoutResponseSchema } },
    description: "Timeout",
  },
  500: {
    content: { "application/json": { schema: InternalServerErrorResponseSchema } },
    description: "Internal server error",
  },
} satisfies Record<number, ResponseOpenApiSchema>;

interface ResponseOptions<
  T extends z.ZodObject<any, any> | z.ZodRecord<any, any> = z.ZodObject<any, any> | z.ZodRecord<any, any>,
> {
  schema: T;
  description: string;
  example?: z.infer<T>;
}
type ResponseOptionsRecord = Record<number, ResponseOptions>;

type ResponsesResult<R extends ResponseOptionsRecord> = Merge<
  {
    [K in Extract<keyof R, number>]: {
      content: { "application/json": { schema: R[K]["schema"] } };
      description: R[K]["description"];
    };
  },
  typeof GlobalResponses
>;
export const defineResponses = <const R extends ResponseOptionsRecord>(options: R): ResponsesResult<R> => {
  const result = { ...GlobalResponses } as ResponsesResult<R>;

  for (const key in options) {
    const { description, schema, example } = options[key];
    result[key] = { content: { "application/json": { schema, example } }, description } as never;
  }

  return result;
};
