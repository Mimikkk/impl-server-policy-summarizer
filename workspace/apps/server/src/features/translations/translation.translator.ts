import type { Container } from "@configs/container.ts";
import { z } from "@hono/zod-openapi";
import { compactMessage } from "@utilities/messages.ts";
import {
  type Translation,
  translationFormat,
  type TranslationSample,
  translationSampleSchema,
  translationSchema,
} from "./translation.resources.ts";

export const translateSchema = z.object({
  samples: z.array(translationSampleSchema).optional(),
  context: z.string().optional().openapi({
    example: "casual conversation",
    description: "The context of the translation",
  }),
  sourceLanguage: z.string().openapi({ example: "en", description: "The source language" }),
  targetLanguage: z.string().openapi({ example: "pl", description: "The target language" }),
  original: z.string().openapi({ example: "Hello, how are you?", description: "The original text" }),
  alternativesCount: z.number().optional().openapi({
    example: 1,
    description: "The number of alternatives to generate",
  }).default(1),
});

export type TranslatePayload = z.infer<typeof translateSchema>;

export class TranslationTranslator {
  static new({ llm, logger }: Pick<Container, "llm" | "logger">): TranslationTranslator {
    return new TranslationTranslator(llm, logger);
  }

  private constructor(
    private readonly llm: Container["llm"],
    private readonly logger: Container["logger"],
  ) {}

  static #styles = [
    "Use natural, everyday language.",
    "Use a more formal, professional tone.",
    "Use a casual, conversational style.",
    "Use precise, technical language.",
    "Use expressive, colorful language.",
    "Use simple, clear language suitable for all audiences.",
  ];

  async translate(
    { samples, context, sourceLanguage, targetLanguage, original, alternativesCount }: TranslatePayload,
  ): Promise<Translation[]> {
    const systemPrompt = this.#buildSystemPrompt({ context, sourceLanguage, targetLanguage });
    const previousTranslations: string[] = [];
    const results: Translation[] = [];

    for (let i = 0; i < alternativesCount; i++) {
      let retries = 3;
      while (retries-- > 0) {
        try {
          const userPrompt = this.#buildUserPrompt({
            samples,
            original,
            sourceLanguage,
            targetLanguage,
            alternativeIndex: i,
            previousTranslations,
          });

          const { response } = await this.llm.infer({
            prompt: userPrompt,
            system: systemPrompt,
            format: translationFormat,
          });

          const result = translationSchema.parse(JSON.parse(response));
          previousTranslations.push(result.translation);
          results.push(result);
          break;
        } catch (error) {
          this.logger.error(error, "[TranslationTranslator] [translate] Failed to parse translation");
        }
      }
    }

    return results;
  }

  #buildSystemPrompt(
    { context, sourceLanguage, targetLanguage }: { context?: string; sourceLanguage: string; targetLanguage: string },
  ): string {
    return compactMessage(`
      You are a professional translation engine. You translate text from ${sourceLanguage} to ${targetLanguage}.
      ${context ? `Context: ${context}` : ""}
      
      Rules:
      - Preserve the meaning and tone of the original text
      - Use natural, fluent language in the target language
      - Maintain formatting and structure
      - Do not add explanations or notes
    `);
  }

  #buildUserPrompt(
    { samples, original, sourceLanguage, targetLanguage, alternativeIndex, previousTranslations }: {
      samples?: TranslationSample[];
      original: string;
      sourceLanguage: string;
      targetLanguage: string;
      alternativeIndex: number;
      previousTranslations: string[];
    },
  ): string {
    const chunks: string[] = [];

    if (samples && samples.length > 0) {
      chunks.push(
        "Here are some example translations:\n",
        ...samples.map((sample) =>
          `${sample.original} (${sourceLanguage}) -> ${sample.translation} (${targetLanguage})`
        ),
      );
    }

    chunks.push(
      `Now translate this text from ${sourceLanguage} to ${targetLanguage}:\n${original}\n`,
    );

    if (previousTranslations.length > 0) {
      chunks.push(
        `IMPORTANT: The following translations have already been provided. Generate a DIFFERENT translation with a different style or word choice:\n`,
        ...previousTranslations.map((prev, idx) => `Alternative ${idx + 1}: ${prev}\n`),
      );
    }

    if (alternativeIndex < TranslationTranslator.#styles.length) {
      chunks.push(`Style guidance: ${TranslationTranslator.#styles[alternativeIndex]}`);
    } else {
      chunks.push(`Style guidance: Provide a unique variation, avoiding repetition of previous alternatives.`);
    }

    return compactMessage(chunks.join("\n"));
  }
}
