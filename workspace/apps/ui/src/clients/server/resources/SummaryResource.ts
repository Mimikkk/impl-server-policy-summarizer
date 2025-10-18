import z from "zod";
import { entitySchema } from "./Entity.ts";

export const summarySchema = entitySchema.extend({
  /** The content of the summary */
  content: z.string(),
  /** The summary of the content */
  summary: z.string(),
});

export interface SummaryResource extends z.infer<typeof summarySchema> {}
