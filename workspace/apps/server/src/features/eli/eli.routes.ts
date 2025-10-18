import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { EliResource } from "./eli.resources.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/eli-operations/summarize",
    tags: ["ELI Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              eli: z.string().min(1).openapi({
                description: "The ELI of the data",
                example: "DU/2017/2196",
                title: "ELI",
              }),
            }),
            example: { eli: "DU/2017/2196" },
          },
        },
        description: "The request body",
        required: true,
      },
    },
    responses: defineResponses({
      200: {
        schema: EliResource.schema,
        description: "The ELI data",
      },
      404: {
        schema: z.object({
          status: z.number().describe("The error code."),
          message: z.string().describe("The error message."),
        }).openapi("ELI - Errors - NotFoundErrorResponse"),
        description: "ELI not found",
      },
    }),
  },
  async (context) => {
    const { eli } = context.req.valid("json");
    const url = eli;
    const content = await context.var.services.pdf.stringify(url);
    if (!content) return context.json({ status: 404, message: "ELI not found" }, 404);

    const summary = await context.var.services.pdf.summarize(content);
    if (!summary) return context.json({ status: 404, message: "ELI not found" }, 404);

    const entity = await context.var.database.insert(EliResource.table).values({ eli, summaryId: summary.id })
      .returning().get();

    return context.json(entity, 200);
  },
);
