import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";

export const SummaryResource = defineEntity({
  tableName: "summaries",
  resourceName: "summary",
  columns: {
    content: text("content").notNull(),
    summary: text("summary").notNull(),
  },
  refine: {
    content: (z) =>
      z.openapi({
        example: "When you ask to summarize a text, will use this field the text.",
        description: "The text of the summary",
      }),
    summary: (z) =>
      z.openapi({
        example: "Provide the text to summarize.",
        description: "The summary of the text",
      }),
  },
  description: "The summaries of the text",
});
