import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { summaries, summarySchema } from "./summaries.entity.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/summarize",
    tags: ["Summarize"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({ content: z.string().min(1).describe("The content of the text") }),
            example: { content: "The content of the text" },
          },
        },
        description: "The request body",
        required: true,
      },
    },
    responses: defineResponses({
      200: {
        schema: summarySchema,
        description: "The summary of the text",
      },
    }),
  },
  async (context) => {
    const { content } = context.req.valid("json");

    const { response: summary } = await context.var.llm.infer({
      prompt: `
        Summarize the following text in maximum of 100 words.
        \`\`\`txt
        ${content}
        \`\`\`
      `,
    });

    const [entity] = await context.var.database.insert(summaries).values({ content, summary }).returning();

    return context.json(entity, 200);
  },
);
