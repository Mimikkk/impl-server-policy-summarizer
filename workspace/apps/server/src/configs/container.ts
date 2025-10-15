import type { MetricMonitor } from "@features/monitoring/monitors/MetricMonitor.ts";
import type { DrizzleClient } from "../clients/DrizzleClient.ts";
import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  database: typeof DrizzleClient;
  logger: typeof Logger;
  llm: OllamaClient;
  metrics: MetricMonitor;
}

export const container: Container = {
  database: null!,
  logger: null!,
  llm: null!,
  metrics: null!,
};
