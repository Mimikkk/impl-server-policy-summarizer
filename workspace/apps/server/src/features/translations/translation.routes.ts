import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import {
  regenerateSchema,
  translateSchema,
  type Translation,
  translationSchema,
  type Verification,
  verificationSchema,
  verifySchema,
} from "./translation.service.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/translations/translate",
    tags: ["Translations"],
    request: { body: { content: { "application/json": { schema: translateSchema } } } },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(translationSchema) }),
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
    request: { body: { content: { "application/json": { schema: regenerateSchema } } } },
    responses: defineResponses((c) => ({
      200: {
        schema: z.object({ translations: z.array(translationSchema) }),
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
