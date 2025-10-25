import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { TranslationResource } from "./translation.resources.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/translate",
    tags: ["Translations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.union([
              TranslationResource.schema.pick({ sourceLanguage: true, targetLanguage: true, original: true })
                .openapi({ title: "Translation", description: "Single text to translate" }),
              TranslationResource.schema.pick({ sourceLanguage: true, targetLanguage: true }).extend({
                original: z.array(TranslationResource.schema.shape.original),
              }).openapi({ title: "Translations", description: "The translations to translate" }),
            ]),
            example: { sourceLanguage: "en", targetLanguage: "pl", original: "The text to translate" },
          },
          "multipart/form-data": {
            schema: z.object({
              sourceLanguage: z.string(),
              targetLanguage: z.string(),
              file: z.instanceof(File).openapi({ type: "string", format: "binary" }),
            }).openapi({ title: "CSVTranslationUpload", description: "Translate texts from uploaded CSV" }),
            example: {},
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.union([
          c.common.resource(TranslationResource).schema,
          c.common.resources(TranslationResource).schema,
        ]),
        description: "The translation or translations",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const contentType = context.req.header("content-type");

    if (contentType?.includes("multipart/form-data")) {
      const form = await context.req.formData();
      const sourceLanguage = form.get("sourceLanguage")?.toString() ?? "";
      const targetLanguage = form.get("targetLanguage")?.toString() ?? "";
      const file = form.get("file");

      if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
        return context.json({ status: 422, message: "Missing or invalid file for translation." }, 422);
      }

      try {
        const translations = await context.var.services.translations.translateCsv({
          sourceLanguage,
          targetLanguage,
          file,
        });

        if (!translations || translations.length === 0) {
          return context.json({ status: 422, message: "Failed to translate the CSV." }, 422);
        }

        return context.json(translations, 200);
      } catch {
        return context.json({ status: 422, message: "CSV processing failed." }, 422);
      }
    }

    const { sourceLanguage, targetLanguage, original } = context.req.valid("json") as {
      sourceLanguage: string;
      targetLanguage: string;
      original: string | string[];
    };

    if (Array.isArray(original)) {
      const entities = await context.var.services.translations.translateMany({
        sourceLanguage,
        targetLanguage,
        original,
      });

      if (entities.length === 0 && original.length > 0) {
        return context.json({ status: 422, message: "Failed to translate the texts." }, 422);
      }

      return context.json(entities, 200);
    }

    const entity = await context.var.services.translations.translate({
      sourceLanguage,
      targetLanguage,
      original,
    });
    if (!entity) return context.json({ status: 422, message: "Failed to translate the text." }, 422);

    return context.json(entity, 200);
  },
);
