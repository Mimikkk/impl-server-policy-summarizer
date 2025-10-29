import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import type { Translation, Verification } from "./translation.service.ts";

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
              alternativesCount: z.number().optional().openapi({ example: 1 }).default(1),
              context: z.string().optional().openapi({ example: "casual conversation" }),
              samples: z.array(z.object({
                original: z.string().openapi({ example: "There once was a ship." }),
                translation: z.string().openapi({ example: "Kiedyś tam był statek." }),
              })).optional(),
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({
          translations: z.array(z.object({ translation: z.string().openapi({ example: "Cześć, jak się masz?" }) })),
        }),
        description: "Streamed translations",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const results: Translation[] = [];
    for await (const result of context.var.services.translations.translate(values)) {
      results.push(result);
    }

    if (results.length === 0) {
      return context.json({ status: 422, message: "Failed to generate translations." }, 422);
    }

    return context.json({ translations: results }, 200);
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
        schema: z.object({
          translations: z.array(z.object({ translation: z.string().openapi({ example: "Jak się masz? Cześć!" }) })),
        }),
        description: "Regenerated translations",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const results: Translation[] = [];
    for await (const result of context.var.services.translations.regenerate(values)) {
      results.push(result);
    }

    if (results.length === 0) {
      return context.json({ status: 422, message: "Failed to regenerate translations." }, 422);
    }

    return context.json({ translations: results }, 200);
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
              samples: z.array(z.object({
                original: z.string().openapi({ example: "There once was a ship." }),
                translation: z.string().openapi({ example: "Kiedyś tam był statek." }),
              })).optional(),
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({
          isValid: z.boolean().openapi({ example: true }),
          issues: z.array(z.string().openapi({ example: "The translation is not natural." })).optional(),
          score: z.number().optional().openapi({ example: 80 }),
          suggestions: z.array(z.string().openapi({ example: "Use more natural language." })).optional(),
        }),
        description: "Translation verification result",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    let result: Verification | undefined = undefined;
    for await (const verification of context.var.services.translations.verify(values)) {
      result = verification;
    }

    if (!result) {
      return context.json({ status: 422, message: "Failed to verify translation." }, 422);
    }

    return context.json(result, 200);
  },
);
