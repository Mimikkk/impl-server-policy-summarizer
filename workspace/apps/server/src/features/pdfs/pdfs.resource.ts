import { z } from "@hono/zod-openapi";
import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";

export const SummaryResource = defineEntity({
  tableName: "summaries",
  resourceName: "summary",
  columns: {
    content: text("content").notNull(),
    summary: text("summary").notNull(),
    details: text("details").notNull(),
    takeaways: text("takeaways").notNull(),
  },
  refine: {
    content: (z) =>
      z.openapi({
        example: "When you ask to summarize a text, will use this field the text.",
        description: "The text of the summary",
      }),
    summary: (z) =>
      z.openapi({
        example: "20-40 words. One or two sentences that capture the main point.",
        description: "The short summary of the text",
      }),
    details: (z) =>
      z.openapi({
        example: "60-100 words. A paragraph that explains the key information in more detail.",
        description: "The detailed summary of the text",
      }),
    takeaways: (z) =>
      z.openapi({
        example: "1-4 bullet points. Each point is one short sentence about a key fact or idea.",
        description: "The takeaways of the text",
      }),
  },
  description: "The summaries of the text",
});

export type Summary = z.infer<typeof SummaryResource.schema>;
