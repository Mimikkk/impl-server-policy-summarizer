import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { SummaryResource } from "./pdfs.resource.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/summarize",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.union([
              z.object({
                url: z.url().describe("The url containing an pdf file."),
              }).openapi({
                title: "URL content",
                description: "The url containing an pdf file to extract text from.",
              }),
              z.object({
                content: z.string().min(1).describe("The content of the text"),
              }).openapi({
                title: "Text content",
                description: "The text content to summarize",
              }),
            ]),
            example: { url: "https://pdfobject.com/pdf/sample.pdf" },
          },
        },
        description: "The request body",
        required: true,
      },
    },
    responses: defineResponses({
      200: {
        schema: SummaryResource.schema,
        description: "The summary of the text",
      },
      400: {
        schema: z.object({
          status: z.number().describe("The error code."),
          message: z.string().describe("The error message."),
        }).openapi("PDF Operations - Errors - UnprocessablePdfErrorResponse"),
        description: "Failed to parse the file",
      },
    }),
  },
  async (context) => {
    const values = context.req.valid("json");

    let content = "";
    if ("content" in values) {
      content = values.content;
    } else {
      try {
        content = await context.var.services.pdf.stringify(values.url) ?? "";
      } catch {
        return context.json({ status: 400, message: "Failed to parse the file." }, 400);
      }
    }

    const entity = await context.var.services.pdf.summarize(content);

    return context.json(entity, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/extract-text",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({ url: z.url().describe("The url containing an pdf file.") }),
            example: { url: "https://pdfobject.com/pdf/sample.pdf" },
          },
        },
      },
    },
    responses: defineResponses({
      200: {
        schema: z.object({
          content: z.string().describe("The content of the file"),
        }).openapi("PDF Operations - Results - PdfContentResponse"),
        description: "The content of the file as text",
      },
      400: {
        schema: z.object({
          status: z.number().describe("The error code."),
          message: z.string().describe("The error message."),
        }).openapi("PDF Operations - Errors - UnprocessablePdfErrorResponse"),
        description: "Failed to parse the file",
      },
    }),
  },
  async (context) => {
    const { url } = context.req.valid("json") as { url: string };

    try {
      const content = await context.var.services.pdf.stringify(url) ?? "";

      return context.json({ content }, 200);
    } catch {
      return context.json({ status: 400, message: "Failed to parse the file." }, 400);
    }
  },
);
