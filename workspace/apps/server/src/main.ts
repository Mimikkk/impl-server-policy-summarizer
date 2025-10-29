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

const controller = new AbortController();
const { signal } = controller;

Deno.serve({
  onListen() {
    Logger.info(`Server is running at "http://${Environment.Server.Host}:${Environment.Server.Port}".`);
    Logger.info(`Deno version: ${Deno.version.deno}`);
    Logger.info(`V8 version: ${Deno.version.v8}`);
    Logger.info(`Typescript version: ${Deno.version.typescript}`);

    type WindowsSignal = "SIGINT" | "SIGBREAK";
    type UnixSignal = "SIGTERM" | "SIGQUIT" | "SIGKILL";
    const gracefulShutdown = (signal: WindowsSignal | UnixSignal) => {
      Logger.info(`Caught "${signal}", shutting down gracefully...`);

      controller.abort();
      Deno.exit(0);
    };

    if (Deno.build.os === "windows") {
      Deno.addSignalListener("SIGINT", () => gracefulShutdown("SIGINT"));
      Deno.addSignalListener("SIGBREAK", () => gracefulShutdown("SIGBREAK"));
    } else {
      Deno.addSignalListener("SIGTERM", () => gracefulShutdown("SIGTERM"));
      Deno.addSignalListener("SIGQUIT", () => gracefulShutdown("SIGQUIT"));
      Deno.addSignalListener("SIGKILL", () => gracefulShutdown("SIGKILL"));
    }
  },
  port: Environment.Server.Port,
  hostname: Environment.Server.Host,
  signal,
}, HonoClient.fetch);
