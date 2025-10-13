import { Environment } from "@configs/environment.ts";
import { createRoute, z } from "@hono/zod-openapi";
import { compactMessage } from "@utilities/messages.ts";
import { HonoClient } from "../clients/HonoClient.ts";
import { responses } from "../core/messages/errors.ts";

HonoClient.openapi(
  createRoute({
    method: "post",
    path: "/api/v1/summarize",
    tags: ["Summarize"],
    request: {
      body: {
        content: { "application/json": { schema: z.object({ content: z.string() }) } },
        required: true,
      },
    },
    responses: responses({
      200: {
        schema: z.object({ summary: z.string() }),
        description: "The summary of the text",
      },
    }),
  }),
  async (context) => {
    const { content } = context.req.valid("json");
    const { ollama } = context.var;

    const response = await ollama.api.generate({
      model: Environment.Ollama.Model,
      prompt: compactMessage(`
        Summarize the following text in 100 words.
        \`\`\`txt
        ${content}
        \`\`\`
    `),
    });

    return context.json({ summary: response.response }, 200);
  },
);
