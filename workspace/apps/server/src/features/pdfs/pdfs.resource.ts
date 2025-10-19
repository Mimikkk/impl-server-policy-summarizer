import type { z } from "@hono/zod-openapi";
import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";
import { samples } from "../docs/samples.ts";

export const TextExtractionResource = defineEntity({
  tableName: "text_extractions",
  resourceName: "textExtraction",
  columns: {
    sourceType: text("source_type", { enum: ["url"] }).notNull(),
    sourceRef: text("source_ref").notNull(),
    content: text("content").notNull(),
  },
  refine: {
    sourceType: (z) =>
      z.openapi({
        example: "url",
        description: "The type of the source.",
      }),
    sourceRef: (z) =>
      z.openapi({
        example: "https://pdfobject.com/pdf/sample.pdf",
        description: "The reference to the source of the content.",
      }),
    content: (z) =>
      z.openapi({
        example: "This is the full text...",
        description: "The text content extracted from the source",
      }),
  },
  description: "The content of a file extracted from a source",
});

export type TextExtraction = z.infer<typeof TextExtractionResource.schema>;

export const TextSummaryResource = defineEntity({
  tableName: "text_summaries",
  resourceName: "textSummary",
  columns: {
    textExtractionId: text("text_extraction_id")
      .notNull().references(() => TextExtractionResource.table.id),
    summary: text("summary").notNull(),
    details: text("details").notNull(),
    takeaways: text("takeaways", { mode: "json" }).$type<string[]>().notNull(),
  },
  refine: {
    textExtractionId: (z) =>
      z.openapi({
        example: samples.ids.uuid,
        description: "The identifier of the text extraction",
      }),
    summary: (z) =>
      z.openapi({
        example: "This policy establishes new regulations for data protection in the EU.",
        description: "20-40 words. One or two sentences that capture the main point.",
      }),
    details: (z) =>
      z.openapi({
        example:
          "The policy introduces comprehensive data protection measures affecting all EU member states. It establishes new requirements for data processing, storage, and user consent mechanisms.",
        description: "60-100 words. A paragraph that explains the key information in more detail.",
      }),
    takeaways: (z) =>
      z.openapi({
        example: [
          "All companies must implement new consent mechanisms",
          "Data retention limited to 2 years",
          "Penalties up to 4% of revenue",
        ],
        description: "Each takeaway is one short sentence about a key fact or idea.",
      }),
  },
  description: "The summaries of the text",
});

export type TextSummary = z.infer<typeof TextSummaryResource.schema>;
