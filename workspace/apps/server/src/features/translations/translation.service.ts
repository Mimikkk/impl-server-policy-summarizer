import type { Container } from "@configs/container.ts";
import { z } from "zod/v4";
import { parseCsv } from "../csvs/csv.routes.ts";
import { Translation, TranslationResource } from "./translation.resources.ts";

export class TranslationService {
  static new({ database, llm, logger }: Pick<Container, "database" | "llm" | "logger">): TranslationService {
    return new TranslationService(database, llm, logger);
  }

  private constructor(
    private readonly database: Container["database"],
    private readonly llm: Container["llm"],
    private readonly logger: Container["logger"],
  ) {}

  static #translationFormat = {
    type: "object",
    properties: { translation: { type: "string" } },
    required: ["translation"],
  };

  static #translationSystem = `
    You are a translation engine. You translate the text from the source language to the target language.
    `;
  static #translationSchema = TranslationResource.schema.pick({ translation: true });

  async translate(
    { sourceLanguage, targetLanguage, original }: { sourceLanguage: string; targetLanguage: string; original: string },
  ): Promise<Translation | undefined> {
    let retries = 5;
    this.logger.debug(`[TranslateService] Starting translation from "${sourceLanguage}" to "${targetLanguage}".`);

    while (retries-- > 0) {
      try {
        this.logger.debug(`[TranslateService] Requesting translation. Retries left: ${retries}.`);
        const { response } = await this.llm.infer({
          format: TranslationService.#translationFormat,
          system: TranslationService.#translationSystem,
          prompt: `Translate the text from "${sourceLanguage}" to "${targetLanguage}":\n${original}.`,
        });

        const { success, data } = TranslationService.#translationSchema.safeParse(JSON.parse(response));
        if (!success) {
          this.logger.warn(`[TranslateService] Validation failed for response. Retries left: ${retries}.`);
          this.logger.warn(`[TranslateService] Response: ${response}.`);
          continue;
        }

        this.logger.debug(
          `[TranslateService] Inserting translation for "${original.substring(0, 20)}..." into database.`,
        );
        const result = await this.database.insert(TranslationResource.table).values({
          sourceLanguage,
          targetLanguage,
          original,
          translation: data.translation,
        }).returning().get();

        this.logger.debug(`[TranslateService] Successfully translated and saved.`);
        return result;
      } catch (error) {
        this.logger.error(`[TranslateService] Error during translation: ${error}. Retries left: ${retries}.`);
      }
    }

    this.logger.warn(`[TranslateService] Translation failed after all retries for "${original.substring(0, 20)}...".`);
    return undefined;
  }

  static #translateManyFormat = {
    type: "array",
    items: {
      type: "object",
      properties: { translation: { type: "string" } },
    },
    required: ["translation"],
  };
  static #translateManySchema = z.array(TranslationResource.schema.pick({ translation: true }));
  static #translateManyBatchSize = 50;
  async translateMany(
    { sourceLanguage, targetLanguage, original }: {
      sourceLanguage: string;
      targetLanguage: string;
      original: string[];
    },
  ): Promise<Translation[]> {
    this.logger.debug(
      `[TranslateService] Starting translation: ${original.length} items from "${sourceLanguage}" to "${targetLanguage}". Batch size: ${TranslationService.#translateManyBatchSize}.`,
    );
    const allResults: Translation[] = [];
    const size = TranslationService.#translateManyBatchSize;

    for (let i = 0; i < original.length; i += size) {
      const batch = original.slice(i, i + size);
      this.logger.debug(`[TranslateService] Processing batch ${i / size + 1}: ${batch.length} items.`);

      let retries = 5;
      while (retries-- > 0) {
        try {
          const { response } = await this.llm.infer({
            format: TranslationService.#translateManyFormat,
            system: TranslationService.#translationSystem,
            prompt: `Translate the texts from ${sourceLanguage} to ${targetLanguage}:\n${
              batch.map((text) => `"${text}"`).join("\n")
            }.`,
          });

          const { success, data } = TranslationService.#translateManySchema.safeParse(JSON.parse(response));
          if (!success || !Array.isArray(data) || data.length !== batch.length) {
            this.logger.warn(
              `[TranslateService] Validation failed for batch ${i / size + 1}. Retries left: ${retries}.`,
            );
            this.logger.warn(`[TranslateService] Response: ${response}.`);
            continue;
          }

          const values = await this.database.insert(TranslationResource.table).values(
            data.map(({ translation }, i) => ({
              sourceLanguage,
              targetLanguage,
              original: batch[i],
              translation,
            })),
          ).returning().all();

          this.logger.debug(`[TranslateService] Successfully translated and stored batch ${i / size + 1}.`);
          allResults.push(...values);
          break;
        } catch (error) {
          this.logger.error(`[TranslateService] Error in batch ${i / size + 1}: ${error}. Retries left: ${retries}.`);
        }
      }
    }

    this.logger.debug(`[TranslateService] Finished translation. Total results: ${allResults.length}.`);
    return allResults;
  }

  async translateCsv(
    { sourceLanguage, targetLanguage, file }: {
      sourceLanguage: string;
      targetLanguage: string;
      file: File;
    },
  ): Promise<Translation[]> {
    this.logger.debug(`[TranslateService] Starting translation of CSV file.`);

    try {
      const rows = await parseCsv(file);
      return this.translateMany({ sourceLanguage, targetLanguage, original: rows.map((row) => row[sourceLanguage]) });
    } catch (error) {
      this.logger.error(`[TranslateService] Error parsing CSV file: ${error}.`);
      throw error;
    }
  }
}
