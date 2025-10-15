import type { MetricMonitor } from "@features/monitoring/monitors/MetricMonitor.ts";
import type { DrizzleClient } from "../clients/DrizzleClient.ts";
import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  database: typeof DrizzleClient;
  logger: typeof Logger;
  ollama: OllamaClient;
  metrics: MetricMonitor;
}

export const container: Container = {
  database: null!,
  logger: null!,
  ollama: null!,
  metrics: null!,
};
