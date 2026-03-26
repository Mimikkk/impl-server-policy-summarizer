import "@configs/pdf-js/pdfjs.ts";
import "./api.routes.ts";
//
import { container } from "@configs/container.ts";
import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { CsvService } from "@features/csv-operations/csv.service.ts";
import { MetricMonitor } from "@features/metrics/monitors/MetricMonitor.ts";
import { PdfService } from "@features/pdfs-operations/pdfs.service.ts";
import { TranslationService } from "@features/translations/translation.service.ts";
import { DrizzleClient } from "./clients/DrizzleClient.ts";
import { HonoClient } from "./clients/HonoClient.ts";
import { OllamaClient } from "./clients/OllamaClient.ts";

container.logger = Logger;
container.llm = await OllamaClient.fromEnvironment();
container.metrics = MetricMonitor.empty();
container.database = DrizzleClient;
container.services.pdfs = PdfService.new(container);
container.services.csvs = CsvService.new(container);
container.services.translations = TranslationService.new(container);

const server = Bun.serve({
  port: Environment.Server.Port,
  hostname: Environment.Server.Host,
  fetch: HonoClient.fetch,
});

Logger.info(`Server is running at "${server.url}".`);
Logger.info(`Bun version: ${Bun.version}`);

type WindowsSignal = "SIGINT" | "SIGBREAK";
type UnixSignal = "SIGTERM" | "SIGQUIT";
const gracefulShutdown = (sig: WindowsSignal | UnixSignal) => {
  Logger.info(`Caught "${sig}", shutting down gracefully...`);
  server.stop();
  process.exit(0);
};

if (process.platform === "win32") {
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGBREAK", () => gracefulShutdown("SIGBREAK"));
} else {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));
}
