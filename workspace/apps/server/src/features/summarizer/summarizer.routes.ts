import { Environment } from "@configs/environment.ts";
import { z } from "@hono/zod-openapi";
import { compactMessage } from "@utilities/messages.ts";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";

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
        schema: z.object({ summary: z.string().describe("The content of the summary") }),
        example: { summary: "The content of the summary" },
        description: "The summary of the text",
      },
    }),
  },
  async (context) => {
    const { content } = context.req.valid("json");

    const { ollama } = context.var;

    const response = await ollama.api.generate({
      model: Environment.Ollama.Model,
      prompt: compactMessage(`
        Summarize the following text in maximum of 100 words.
        \`\`\`txt
        ${content}
        \`\`\`
    `),
    });

    return context.json({ summary: response.response }, 200);
  },
);
