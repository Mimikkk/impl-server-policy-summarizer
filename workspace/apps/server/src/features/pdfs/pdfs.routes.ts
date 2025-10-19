import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineParams, defineResponses } from "../docs/defineResponses.ts";
import { samples } from "../docs/samples.ts";
import { TextExtractionResource, TextSummaryResource } from "./pdfs.resource.ts";
import type { TextSource } from "./pdfs.service.ts";

const sourceContentSchema = z.object({
  url: z.url().describe("The url containing an pdf file."),
}).transform((values) => ({ type: "url", ref: values.url }) satisfies TextSource).openapi({
  title: "URL content",
  description: "The url containing an pdf file to extract text from.",
});
export const sourceContentExample = { url: samples.urls.pdf };

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/summarize",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: sourceContentSchema,
            example: sourceContentExample,
          },
        },
        required: true,
      },
    },
    responses: defineResponses((c) => ({
      200: c.common.resource(TextSummaryResource),
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const source = context.req.valid("json");

    const extraction = await context.var.services.pdf.extract(source);
    if (!extraction) return context.json({ status: 422, message: "Failed to extract the text from the file." }, 422);

    const summary = await context.var.services.pdf.summarize(extraction);
    if (!summary) return context.json({ status: 422, message: "Failed to summarize the text." }, 422);

    return context.json(summary, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/extract",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: sourceContentSchema,
            example: sourceContentExample,
          },
        },
        required: true,
      },
    },
    responses: defineResponses((c) => ({
      200: c.common.resource(TextExtractionResource),
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const source = context.req.valid("json");

    const entity = await context.var.services.pdf.extract(source);
    if (!entity) return context.json({ status: 422, message: "Failed to extract the text from the file." }, 422);

    return context.json(entity, 200);
  },
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/pdf-operations/summaries/{id}",
    tags: ["PDF Operations"],
    request: {
      params: defineParams((c) => ({
        id: c.common.id,
      })),
    },
    responses: defineResponses((c) => ({
      200: c.common.resource(TextExtractionResource),
      404: c.common.notfound,
    })),
  },
  async (context) => {
    const { id } = context.req.valid("param");

    const entity = await context.var.services.pdf.extraction(id);
    if (!entity) return context.json({ status: 404, message: "Resource not found." }, 404);

    return context.json(entity, 200);
  },
);

HonoClient.openapi(
  {
    method: "get",
    path: "/api/v1/pdf-operations/extractions/{id}",
    tags: ["PDF Operations"],
    request: {
      params: defineParams((c) => ({
        id: c.common.id,
      })),
    },
    responses: defineResponses((c) => ({
      200: c.common.resource(TextSummaryResource),
      404: c.common.notfound,
    })),
  },
  async (context) => {
    const { id } = context.req.valid("param");

    const entity = await context.var.services.pdf.summary(id);
    if (!entity) return context.json({ status: 404, message: "Resource not found." }, 404);

    return context.json(entity, 200);
  },
);

// HonoClient.openapi(
//   {
//     method: "get",
//     path: "/api/v1/pdf-operations/extractions",
//     tags: ["PDF Operations"],
//     request: {
//       query: defineQuery((c) => ({
//         limit: c.common.limit,
//         offset: c.common.offset,
//       })),
//     },
//     responses: defineResponses((c) => ({
//       200: c.common.resources(TextExtractionResource),
//       404: c.common.notfound,
//     })),
//   },
//   async (context) => {
//     const params = context.req.valid("param");

//     const entities = await context.var.services.pdf.extractions(params);

//     return context.json(entities, 200);
//   },
// );
