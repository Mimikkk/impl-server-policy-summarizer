import { z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
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
    responses: defineResponses((c) => ({
      200: c.common.resource(EliResource),
      404: c.common.notfound,
    })),
  },
  async (context) => {
    const { eli } = context.req.valid("json");
    const url = eli;

    let entity = await context.var.database
      .select().from(EliResource.table).where(eq(EliResource.table.eli, eli)).get();

    if (!entity) {
      entity = await context.var.database.insert(EliResource.table).values({ eli }).returning().get();
    }

    const content = await context.var.services.pdfs.extract({ type: "url", ref: url });
    if (!content) return context.json({ status: 404, message: "ELI not found" }, 404);

    const summary = await context.var.services.pdfs.summarize(content);
    if (!summary) return context.json({ status: 404, message: "ELI not found" }, 404);

    // const entity = await context.var.database.insert(EliResource.table).values({ eli, summaryId: summary.id })
    //   .returning().get();

    return context.json(entity, 200);
  },
);
