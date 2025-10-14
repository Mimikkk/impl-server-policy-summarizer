import type { MonitorService } from "@services/MonitorService.ts";
import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  logger: typeof Logger;
  ollama: OllamaClient;
  monitoring: MonitorService;
}

export const container: Container = {
  logger: null!,
  ollama: null!,
  monitoring: null!,
};
