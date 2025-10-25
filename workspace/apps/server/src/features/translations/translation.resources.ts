import type { z } from "@hono/zod-openapi";
import { defineEntity } from "@persistence/entities/defineEntity.ts";
import { text } from "drizzle-orm/sqlite-core";

export const TranslationResource = defineEntity({
  tableName: "translations",
  resourceName: "translation",
  columns: {
    sourceLanguage: text("source_language").notNull(),
    targetLanguage: text("target_language").notNull(),
    original: text("original").notNull(),
    translation: text("translation").notNull(),
  },
  refine: {
    sourceLanguage: (z) => z.openapi({ example: "en", description: "The source language" }),
    targetLanguage: (z) => z.openapi({ example: "pl", description: "The target language" }),
    original: (z) => z.openapi({ example: "The text to translate", description: "The text to translate" }),
    translation: (z) => z.openapi({ example: "The translated text", description: "The translated text" }),
  },
  description: "The translation of the text",
});

export type Translation = z.infer<typeof TranslationResource.schema>;
