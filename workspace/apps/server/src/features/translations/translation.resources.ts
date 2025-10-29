import { z } from "@hono/zod-openapi";

export const translationSampleSchema = z.object({
  original: z.string().openapi({ example: "There once was a ship.", description: "The original text" }),
  translation: z.string().openapi({ example: "Kiedyś tam był statek.", description: "The translation" }),
});
export type TranslationSample = z.infer<typeof translationSampleSchema>;

export const translationSchema = z.object({
  translation: z.string().openapi({ example: "Cześć, jak się masz?", description: "The translation" }),
});

export type Translation = z.infer<typeof translationSchema>;
