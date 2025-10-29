import { CsvService } from "@features/csvs/csv.service.ts";
import type { MetricMonitor } from "@features/metrics/monitors/MetricMonitor.ts";
import type { PdfService } from "@features/pdfs/pdfs.service.ts";
import type { TranslationService } from "@features/translations/translation.service.ts";
import type { DrizzleClient } from "../clients/DrizzleClient.ts";
import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  database: typeof DrizzleClient;
  logger: typeof Logger;
  llm: OllamaClient;
  metrics: MetricMonitor;
  services: {
    csvs: CsvService;
    pdfs: PdfService;
    translations: TranslationService;
  };
}

export const container: Container = {
  database: null!,
  logger: null!,
  llm: null!,
  metrics: null!,
  services: {
    csvs: null!,
    pdfs: null!,
    translations: null!,
  },
};
