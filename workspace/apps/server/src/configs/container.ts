import type { OllamaClient } from "../clients/OllamaClient.ts";
import type { Logger } from "./logger.ts";

export interface Container {
  logger: typeof Logger;
  ollama: OllamaClient;
}

export const container: Container = {
  logger: null!,
  ollama: null!,
};
