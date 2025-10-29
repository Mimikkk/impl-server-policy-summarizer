import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import type { Translation } from "./translation.service.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/translate",
    tags: ["Translations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sourceLanguage: z.string().openapi({ example: "en" }),
              targetLanguage: z.string().openapi({ example: "pl" }),
              original: z.string().openapi({ example: "Hello, how are you?" }),
              alternativesCount: z.number().optional().openapi({ example: 3 }).default(3),
              context: z.string().optional().openapi({ example: "casual conversation" }),
              samples: z.array(z.object({
                original: z.string(),
                translation: z.string(),
              })).optional(),
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(z.object({ translation: z.string() })) }),
        description: "Streamed translations",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const translations: Translation[] = [];
    for await (const translation of context.var.services.translations.translate(values)) {
      translations.push(translation);
    }

    if (translations.length === 0) {
      return context.json({ status: 422, message: "Failed to generate translations." }, 422);
    }

    return context.json({ translations }, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/regenerate",
    tags: ["Translations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sourceLanguage: z.string().openapi({ example: "en" }),
              targetLanguage: z.string().openapi({ example: "pl" }),
              original: z.string().openapi({ example: "Hello, how are you?" }),
              translation: z.string().openapi({ example: "Cześć, jak się masz?" }),
              alternativesCount: z.number().optional().openapi({ example: 3 }).default(3),
              context: z.string().optional().openapi({ example: "formal conversation" }),
              samples: z.array(z.object({
                original: z.string(),
                translation: z.string(),
              })).optional(),
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(z.object({ translation: z.string() })) }),
        description: "Regenerated translations",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const translations: Translation[] = [];
    for await (const translation of context.var.services.translations.regenerate(values)) {
      translations.push(translation);
    }

    if (translations.length === 0) {
      return context.json({ status: 422, message: "Failed to regenerate translations." }, 422);
    }

    return context.json({ translations }, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/verify",
    tags: ["Translations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sourceLanguage: z.string().openapi({ example: "en" }),
              targetLanguage: z.string().openapi({ example: "pl" }),
              original: z.string().openapi({ example: "Hello, how are you?" }),
              translation: z.string().openapi({ example: "Cześć, jak się masz?" }),
              context: z.string().optional().openapi({ example: "casual conversation" }),
              samples: z.array(z.object({ original: z.string(), translation: z.string() })).optional(),
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({
          isValid: z.boolean(),
          issues: z.array(z.string()).optional(),
          score: z.number().optional(),
          suggestions: z.array(z.string()).optional(),
        }),
        description: "Translation verification result",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    let lastVerification = undefined;
    for await (
      const verification of context.var.services.translations.verify(values)
    ) {
      lastVerification = verification;
    }

    if (!lastVerification) {
      return context.json({ status: 422, message: "Failed to verify translation." }, 422);
    }

    return context.json(lastVerification, 200);
  },
);
