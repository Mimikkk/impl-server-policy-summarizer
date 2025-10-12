import type { Ollama } from "ollama";
import { OllamaClient } from "../clients/OllamaClient.ts";
import { Logger } from "./logger.ts";

export interface ContainerVariables {
  logger: typeof Logger;
  ollama: Ollama;
}

export const createContainerVariables = async (
  options?: Partial<ContainerVariables>,
): Promise<ContainerVariables> => ({
  logger: options?.logger ?? Logger,
  ollama: options?.ollama ?? (await OllamaClient.fromEnvironment()).client,
});
