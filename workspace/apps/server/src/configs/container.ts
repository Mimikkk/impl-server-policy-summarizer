import type { MetricMonitor } from "@features/monitoring/monitors/MetricMonitor.ts";
import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  logger: typeof Logger;
  ollama: OllamaClient;
  metrics: MetricMonitor;
}

export const container: Container = {
  logger: null!,
  ollama: null!,
  metrics: null!,
};
