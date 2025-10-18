import { z } from "@hono/zod-openapi";
import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";
import { SummaryResource } from "../pdfs/pdfs.resource.ts";

export const EliResource = defineEntity({
  tableName: "eli",
  resourceName: "eli",
  columns: {
    eli: text("eli").notNull(),
    summaryId: text("summary_id").references(() => SummaryResource.table.id),
  },
  refine: {
    eli: (z) =>
      z.openapi({
        example: "DU/2017/2196",
        description: "The ELI of the data",
      }),
    summaryId: (z) =>
      z.openapi({
        example: " a6af0b19-3c05-4ec8-928f-bff269f8aafe ",
        description: "The identifier of the summary",
      }),
  },
  description: "The ELI data",
});

export type Eli = z.infer<typeof EliResource.schema>;
