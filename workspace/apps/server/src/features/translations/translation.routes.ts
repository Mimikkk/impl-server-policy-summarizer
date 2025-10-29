import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { regenerateSchema } from "./translation.regenerator.ts";
import { translationSchema } from "./translation.resources.ts";
import { translateSchema } from "./translation.translator.ts";
import { verificationSchema, verifySchema } from "./translation.verifier.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/translate",
    tags: ["Translations"],
    request: { body: { content: { "application/json": { schema: translateSchema } } } },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(translationSchema) }),
        description: "Generated translations",
      },
      206: {
        schema: z.object({ translations: z.array(translationSchema) }),
        description: "Partially generated translations (some alternatives failed to generate)",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const results = await context.var.services.translations.translate(values);

    if (results.length === 0) {
      return context.json({ status: 422, message: "Failed to generate translations." }, 422);
    }

    if (results.length !== values.alternativesCount) {
      return context.json({ translations: results }, 206);
    }

    return context.json({ translations: results }, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/regenerate",
    tags: ["Translations"],
    request: { body: { content: { "application/json": { schema: regenerateSchema } } } },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(translationSchema) }),
        description: "Regenerated translations",
      },
      206: {
        schema: z.object({ translations: z.array(translationSchema) }),
        description: "Partially regenerated translations (some alternatives failed to regenerate)",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const results = await context.var.services.translations.regenerate(values);

    if (results.length === 0) {
      return context.json({ status: 422, message: "Failed to regenerate translations." }, 422);
    }

    if (results.length !== values.alternativesCount) {
      return context.json({ translations: results }, 206);
    }

    return context.json({ translations: results }, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/verify",
    tags: ["Translations"],
    request: { body: { content: { "application/json": { schema: verifySchema } } } },
    responses: defineResponses((c) => ({
      200: {
        schema: verificationSchema,
        description: "Translation verification result",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const values = context.req.valid("json");

    const result = await context.var.services.translations.verify(values);

    if (!result) {
      return context.json({ status: 422, message: "Failed to verify translation." }, 422);
    }

    return context.json(result, 200);
  },
);
