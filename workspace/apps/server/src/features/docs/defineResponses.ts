import { z } from "@hono/zod-openapi";
import type { Entity } from "@persistence/entities/defineEntity.ts";
import { upperFirst } from "@utilities/messages.ts";
import type { Merge } from "@utilities/types.ts";
import {
  BadRequestResponseSchema,
  InternalServerErrorResponseSchema,
  TimeoutResponseSchema,
} from "../../core/messages/responses.ts";

type ResponseShape = z.ZodObject<any, any> | z.ZodRecord<any, any> | z.ZodArray<any> | z.ZodUnion<any> | z.ZodString;
type ResponseType = "application/json" | "text/csv";

type ResponseOpenApiSchema<T extends ResponseShape = ResponseShape> = {
  content: { "application/json": { schema: T } };
  description: string;
};

const GlobalResponses = {
  400: {
    content: { "application/json": { schema: BadRequestResponseSchema } },
    description: "Bad request error",
  },
  408: {
    content: { "application/json": { schema: TimeoutResponseSchema } },
    description: "Timeout error",
  },
  500: {
    content: { "application/json": { schema: InternalServerErrorResponseSchema } },
    description: "Internal server error",
  },
} satisfies Record<number, ResponseOpenApiSchema>;

interface ResponseOptions<
  TShape extends ResponseShape,
  TType extends ResponseType,
> {
  schema: TShape;
  description: string;
  example?: z.infer<TShape>;
  type?: TType;
}
type ResponseOptionsRecord = Record<number, ResponseOptions<ResponseShape, ResponseType>>;

type ResponsesResult<R extends ResponseOptionsRecord> = Merge<
  {
    [K in Extract<keyof R, number>]: {
      content: { [Y in Extract<R[K]["type"], ResponseType>]: { schema: R[K]["schema"] } };
      description: R[K]["description"];
    };
  },
  typeof GlobalResponses
>;

export const defineResponse = <TShape extends ResponseShape, TType extends ResponseType>(
  options: ResponseOptions<TShape, TType>,
): ResponseOptions<TShape, TType> => options;

const ResponsesContext = {
  common: {
    resources: <const T extends Entity>(entity: T): ResponseOptions<z.ZodArray<T["schema"]>, "application/json"> =>
      defineResponse({
        schema: z.array(entity.schema),
        description: `The ${upperFirst(entity.options.resourceName)} resources`,
      }),
    resource: <const T extends Entity>(entity: T): ResponseOptions<T["schema"], "application/json"> =>
      defineResponse({
        schema: entity.schema,
        description: `The ${upperFirst(entity.options.resourceName)} resource`,
      }),
    notfound: defineResponse({
      schema: z.object({
        status: z.number().describe("The error code."),
        message: z.string().describe("The error message."),
      }).openapi("Core - Errors - NotFoundErrorResponse"),
      example: { status: 404, message: "Resource not found." },
      description: "Resource not found",
    }),
    unprocessable: defineResponse({
      schema: z.object({
        status: z.number().describe("The error code."),
        message: z.string().describe("The error message."),
      }).openapi("Core - Errors - UnprocessableEntityErrorResponse"),
      example: { status: 422, message: "Failed to process the entity." },
      description: "Failed to process the entity",
    }),
  },
};

export const defineResponses = <const R extends ResponseOptionsRecord>(
  options: R | ((context: typeof ResponsesContext) => R),
): ResponsesResult<R> => {
  const result = { ...GlobalResponses } as ResponsesResult<R>;

  if (typeof options === "function") {
    options = options(ResponsesContext);
  }

  for (const key in options) {
    const { description, schema, example, type = "application/json" } = options[key];
    result[key] = { content: { [type]: { schema, example } }, description } as never;
  }

  return result;
};
