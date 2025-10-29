import type { Container } from "@configs/container.ts";
import { z } from "@hono/zod-openapi";
import { compactMessage } from "@utilities/messages.ts";
import { type TranslationSample, translationSampleSchema } from "./translation.resources.ts";

export const verificationSchema = z.object({
  isValid: z.boolean().openapi({ example: true, description: "Whether the translation is valid" }),
  issues: z.array(
    z.string().openapi({ example: "The translation is not natural.", description: "The issues with the translation" }),
  ),
  score: z.number().openapi({ example: 80, description: "The score of the translation" }),
  suggestions: z.array(
    z.string().openapi({ example: "Use more natural language.", description: "The suggestions for the translation" }),
  ),
});

export type Verification = z.infer<typeof verificationSchema>;

export const verifySchema = z.object({
  samples: z.array(translationSampleSchema).optional(),
  context: z.string().optional().openapi({
    example: "casual conversation",
    description: "The context of the translation",
  }),
  sourceLanguage: z.string().openapi({ example: "en", description: "The source language" }),
  targetLanguage: z.string().openapi({ example: "pl", description: "The target language" }),
  original: z.string().openapi({ example: "Hello, how are you?", description: "The original text" }),
  translation: z.string().openapi({ example: "Cześć, jak się masz?", description: "The translation" }),
});

const verificationFormat = {
  type: "object",
  properties: {
    isValid: { type: "boolean" },
    issues: { type: "array", items: { type: "string" } },
    score: { type: "number" },
    suggestions: { type: "array", items: { type: "string" } },
  },
  required: ["isValid", "issues", "score", "suggestions"],
};

export type VerifyPayload = z.infer<typeof verifySchema>;

export class TranslationVerifier {
  static new({ llm, logger }: Pick<Container, "llm" | "logger">): TranslationVerifier {
    return new TranslationVerifier(llm, logger);
  }

  private constructor(
    private readonly llm: Container["llm"],
    private readonly logger: Container["logger"],
  ) {}

  async verify(
    { samples, context, sourceLanguage, targetLanguage, original, translation }: VerifyPayload,
  ): Promise<Verification | undefined> {
    const systemPrompt = this.#buildSystemPrompt({ context, sourceLanguage, targetLanguage });
    const userPrompt = this.#buildUserPrompt({
      samples,
      original,
      translation,
      sourceLanguage,
      targetLanguage,
    });

    let retries = 3;
    while (retries-- > 0) {
      try {
        const { response } = await this.llm.infer({
          prompt: userPrompt,
          system: systemPrompt,
          format: verificationFormat,
        });

        return verificationSchema.parse(JSON.parse(response));
      } catch (error) {
        this.logger.error(error, "[TranslationVerifier] [verify] Failed to parse verification");
      }
    }
  }

  #buildSystemPrompt(
    { context, sourceLanguage, targetLanguage }: { context?: string; sourceLanguage: string; targetLanguage: string },
  ): string {
    return compactMessage(`
      You are a translation quality evaluator. You verify translations from ${sourceLanguage} to ${targetLanguage}.
      ${context ? `Context: ${context}` : ""}
      
      Evaluate translations based on:
      - Accuracy: Does it preserve the original meaning?
      - Fluency: Does it sound natural in the target language?
      - Context appropriateness: Does it fit the given context?
      
      Provide a score from 0-100 where:
      - 90-100: Excellent, publication-ready
      - 70-89: Good, minor improvements possible
      - 50-69: Acceptable, some issues present
      - 0-49: Poor, significant problems
    `);
  }

  #buildUserPrompt(
    { samples, original, translation, sourceLanguage, targetLanguage }: {
      samples?: TranslationSample[];
      original: string;
      translation: string;
      sourceLanguage: string;
      targetLanguage: string;
    },
  ): string {
    const chunks: string[] = [];

    if (samples && samples.length > 0) {
      chunks.push(
        "Here are some reference translations for comparison:",
        ...samples.map((sample) =>
          `- ${sample.original} (${sourceLanguage}) -> ${sample.translation} (${targetLanguage})`
        ),
      );
    }

    chunks.push(
      "\n",
      `Original text (${sourceLanguage}): ${original}\n`,
      `Translation to verify (${targetLanguage}): ${translation}\n`,
      `Evaluate this translation and provide:`,
      `- isValid: true if the translation is acceptable (score >= 50), false otherwise`,
      `- issues: list of specific problems found (empty array if none)`,
      `- score: quality score from 0-100`,
      `- suggestions: list of specific improvements (empty array if none)`,
    );

    return compactMessage(chunks.join("\n"));
  }
}
