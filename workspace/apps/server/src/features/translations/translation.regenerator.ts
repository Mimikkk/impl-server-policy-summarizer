import type { Container } from "@configs/container.ts";
import { z } from "@hono/zod-openapi";
import { compactMessage } from "@utilities/messages.ts";
import {
  type Translation,
  type TranslationSample,
  translationSampleSchema,
  translationSchema,
} from "./translation.resources.ts";

export const regenerateSchema = z.object({
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
  translation: z.string().openapi({ example: "Cześć, jak się masz?", description: "The translation" }),
});
export type RegeneratePayload = z.infer<typeof regenerateSchema>;

export class TranslationRegenerator {
  static new({ llm, logger }: Pick<Container, "llm" | "logger">): TranslationRegenerator {
    return new TranslationRegenerator(llm, logger);
  }

  private constructor(
    private readonly llm: Container["llm"],
    private readonly logger: Container["logger"],
  ) {}

  static #format = {
    type: "object",
    properties: { translation: { type: "string" } },
    required: ["translation"],
  };

  static #styles = [
    "Focus on natural fluency - make it sound like a native speaker.",
    "Focus on precision - ensure every nuance is captured accurately.",
    "Focus on brevity - make it concise without losing meaning.",
    "Focus on expressiveness - capture the emotion and tone.",
    "Focus on formality - adjust the register appropriately.",
    "Focus on creativity - find a unique way to express the same idea.",
  ];

  async *regenerate(
    { samples, context, sourceLanguage, targetLanguage, original, translation, alternativesCount }: RegeneratePayload,
  ): AsyncGenerator<Translation, void, unknown> {
    const systemPrompt = this.#buildSystemPrompt({ context, sourceLanguage, targetLanguage });
    const previousTranslations: string[] = [translation];

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

          let response = "";
          const options = {
            prompt: userPrompt,
            system: systemPrompt,
            format: TranslationRegenerator.#format,
          };
          for await (const chunk of this.llm.stream(options)) {
            response += chunk;
          }

          const result = translationSchema.parse(JSON.parse(response));
          previousTranslations.push(result.translation);
          yield result;
          break;
        } catch (error) {
          this.logger.error(error, "[TranslationRegenerator] [regenerate] Failed to parse translation.");
          if (retries === 0) {
            return;
          }
        }
      }
    }
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
      `Original text (${sourceLanguage}): ${original}`,
      "\n",
      `Generate a better alternative translation from ${sourceLanguage} to ${targetLanguage}. `,
      `Improve clarity, fluency, or accuracy while maintaining the original meaning.`,
    );

    if (previousTranslations.length > 0) {
      chunks.push(
        "IMPORTANT: The following translations have already been considered. Generate a DIFFERENT translation:",
        ...previousTranslations.map((previous, i) => `- ${i === 0 ? "Original" : `Alternative ${i}`}: ${previous}`),
      );
    }

    if (alternativeIndex < TranslationRegenerator.#styles.length) {
      chunks.push(`Approach: ${TranslationRegenerator.#styles[alternativeIndex]}`);
    } else {
      chunks.push(`Approach: Provide a unique variation that differs from all previous attempts.`);
    }

    return compactMessage(chunks.join("\n"));
  }
}
