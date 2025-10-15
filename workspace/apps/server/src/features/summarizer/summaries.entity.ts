import { createSelectSchema, defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";

export const summaries = defineEntity({
  name: "summaries",
  fields: {
    content: text("content").notNull(),
    summary: text("summary").notNull(),
  },
});

export const summarySchema = createSelectSchema(summaries, {
  content: (z) => z.openapi("content", { example: "The content of the text" }),
  summary: (z) => z.openapi("summary", { example: "The content of the summary" }),
  createdAt: (z) => z.openapi("When the entity was created", { example: "The created at of the summary" }),
  updatedAt: (z) => z.openapi("When the entity was last updated", { example: "The updated at of the summary" }),
  id: (z) => z.openapi("id", { example: "The id of the summary" }),
}).openapi("summary contents");
