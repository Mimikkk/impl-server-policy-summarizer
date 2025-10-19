import type { z } from "@hono/zod-openapi";
import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";
import { samples } from "../docs/samples.ts";
import { TextSummaryResource } from "../pdfs/pdfs.resource.ts";

export const EliResource = defineEntity({
  tableName: "eli",
  resourceName: "eli",
  columns: {
    eli: text("eli").notNull().unique(),
    summaryId: text("summary_id").references(() => TextSummaryResource.table.id).unique(),
  },
  refine: {
    eli: (z) =>
      z.openapi({
        example: samples.ids.eli,
        description: "The ELI of the data",
      }),
    summaryId: (z) =>
      z.openapi({
        example: samples.ids.uuid,
        description: "The identifier of the summary",
      }),
  },
  description: "The ELI data",
});

export type Eli = z.infer<typeof EliResource.schema>;
