import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { Ollama } from "ollama";

export class OllamaClient {
  private constructor(
    public readonly client: Ollama,
  ) {}

  static async create({ url, model }: { url: string; model: string }): Promise<OllamaClient> {
    return await new OllamaClient(new Ollama({ host: url })).#prepare(model);
  }

  static async fromEnvironment(): Promise<OllamaClient> {
    return await this.create({ url: Environment.Ollama.Url, model: Environment.Ollama.Model });
  }

  async #prepare(model: string): Promise<this> {
    Logger.info("[OllamaClient][prepare] model preparing...");

    const stream = await this.client.pull({ model, stream: true });
    for await (const response of stream) {
      if (response.status === "success") {
        Logger.info("[OllamaClient][prepare:success] model prepared.");
      } else {
        if (response.status === "pulling manifest" || !response.status.startsWith("pulling")) {
          Logger.debug(`[OllamaClient][prepare:progress] status: ${response.status}.`);
        } else {
          Logger.debug(
            `[OllamaClient][prepare:progress] status: ${response.status} percent: ${
              Math.round(response.completed / response.total * 100)
            }%.`,
          );
        }
      }
    }

    return this;
  }
}
