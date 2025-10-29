import type { Container } from "@configs/container.ts";
import { compactMessage } from "@utilities/messages.ts";

export interface TranslationSample {
  original: string;
  translation: string;
}

export interface Translation {
  translation: string;
}

export interface Verification {
  isValid: boolean;
  issues?: string[];
  score?: number;
  suggestions?: string[];
}

export interface TranslatePayload {
  samples?: TranslationSample[];
  context?: string;
  sourceLanguage: string;
  targetLanguage: string;
  original: string;
  alternativesCount: number;
}

export interface RegeneratePayload {
  samples?: TranslationSample[];
  context?: string;
  sourceLanguage: string;
  targetLanguage: string;
  original: string;
  translation: string;
  alternativesCount: number;
}

export interface VerifyPayload {
  samples?: TranslationSample[];
  context?: string;
  sourceLanguage: string;
  targetLanguage: string;
  original: string;
  translation: string;
}

export class TranslationService {
  static new({ llm, logger }: Pick<Container, "llm" | "logger">): TranslationService {
    return new TranslationService(llm, logger);
  }

  private constructor(
    private readonly llm: Container["llm"],
    private readonly logger: Container["logger"],
  ) {}

  static #translationFormat = {
    type: "object",
    properties: { translation: { type: "string" } },
    required: ["translation"],
  };

  async *translate(
    { samples, context, sourceLanguage, targetLanguage, original, alternativesCount }: TranslatePayload,
  ): AsyncGenerator<Translation, void, unknown> {
    const systemPrompt = this.#buildTranslationSystemPrompt({ context, sourceLanguage, targetLanguage });
    const previousTranslations: string[] = [];

    for (let index = 0; index < alternativesCount; index++) {
      let retries = 3;
      while (retries-- > 0) {
        try {
          const userPrompt = this.#buildTranslationUserPrompt({
            samples,
            original,
            sourceLanguage,
            targetLanguage,
            alternativeIndex: index,
            previousTranslations,
          });

          let response = "";
          const options = {
            prompt: userPrompt,
            system: systemPrompt,
            format: TranslationService.#translationFormat,
          };
          for await (const chunk of this.llm.stream(options)) {
            response += chunk;
          }

          const parsed = JSON.parse(response) as Translation;

          if (parsed.translation && typeof parsed.translation === "string") {
            previousTranslations.push(parsed.translation);
            yield parsed;
            break;
          }
        } catch (error) {
          this.logger.error(error, "[TranslationService] [translate] Failed to parse translation");
          if (retries === 0) {
            return;
          }
        }
      }
    }
  }

  #buildTranslationSystemPrompt(
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

  static #styles = [
    "Use natural, everyday language.",
    "Use a more formal, professional tone.",
    "Use a casual, conversational style.",
    "Use precise, technical language.",
    "Use expressive, colorful language.",
    "Use simple, clear language suitable for all audiences.",
  ];
  #buildTranslationUserPrompt(
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

    if (alternativeIndex < TranslationService.#styles.length) {
      chunks.push(`Style guidance: ${TranslationService.#styles[alternativeIndex]}`);
    } else {
      chunks.push(`Style guidance: Provide a unique variation, avoiding repetition of previous alternatives.`);
    }

    return compactMessage(chunks.join("\n"));
  }

  async *regenerate(
    { samples, context, sourceLanguage, targetLanguage, original, translation, alternativesCount }: RegeneratePayload,
  ): AsyncGenerator<Translation, void, unknown> {
    const systemPrompt = this.#buildTranslationSystemPrompt({ context, sourceLanguage, targetLanguage });
    const previousTranslations: string[] = [translation];

    for (let i = 0; i < alternativesCount; i++) {
      let retries = 3;
      while (retries-- > 0) {
        try {
          const userPrompt = this.#buildRegenerateUserPrompt({
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
            format: TranslationService.#translationFormat,
          };
          for await (const chunk of this.llm.stream(options)) {
            response += chunk;
          }

          const parsed = JSON.parse(response) as Translation;

          if (parsed.translation && typeof parsed.translation === "string") {
            previousTranslations.push(parsed.translation);
            yield parsed;
            break;
          }
        } catch (error) {
          this.logger.error(error, "[TranslationService] [regenerate] Failed to parse translation");
          if (retries === 0) {
            return;
          }
        }
      }
    }
  }

  static #approaches = [
    "Focus on natural fluency - make it sound like a native speaker.",
    "Focus on precision - ensure every nuance is captured accurately.",
    "Focus on brevity - make it concise without losing meaning.",
    "Focus on expressiveness - capture the emotion and tone.",
    "Focus on formality - adjust the register appropriately.",
    "Focus on creativity - find a unique way to express the same idea.",
  ];
  #buildRegenerateUserPrompt(
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

    if (alternativeIndex < TranslationService.#approaches.length) {
      chunks.push(`Approach: ${TranslationService.#approaches[alternativeIndex]}`);
    } else {
      chunks.push(`Approach: Provide a unique variation that differs from all previous attempts.`);
    }

    return compactMessage(chunks.join("\n"));
  }

  static #verificationFormat = {
    type: "object",
    properties: {
      isValid: { type: "boolean" },
      issues: { type: "array", items: { type: "string" } },
      score: { type: "number" },
      suggestions: { type: "array", items: { type: "string" } },
    },
    required: ["isValid", "issues", "score", "suggestions"],
  };

  async *verify(
    { samples, context, sourceLanguage, targetLanguage, original, translation }: VerifyPayload,
  ): AsyncGenerator<Verification, void, unknown> {
    const systemPrompt = this.#buildVerificationSystemPrompt({ context, sourceLanguage, targetLanguage });
    const userPrompt = this.#buildVerificationUserPrompt({
      samples,
      original,
      translation,
      sourceLanguage,
      targetLanguage,
    });

    let retries = 3;
    while (retries-- > 0) {
      try {
        let accumulated = "";

        for await (
          const chunk of this.llm.stream({
            prompt: userPrompt,
            system: systemPrompt,
            format: TranslationService.#verificationFormat,
          })
        ) {
          accumulated += chunk;

          try {
            const partial = JSON.parse(accumulated) as Verification;
            yield partial;
          } catch {
          }
        }

        const parsed = JSON.parse(accumulated) as Verification;

        if (typeof parsed.isValid === "boolean") {
          yield parsed;
          return;
        }
      } catch (error) {
        this.logger.error(error, "[TranslationService] [verify] Failed to parse verification");
        if (retries === 0) {
          return;
        }
      }
    }
  }

  #buildVerificationSystemPrompt(
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

  #buildVerificationUserPrompt(
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
