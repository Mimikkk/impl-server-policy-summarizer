import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { compactMessage } from "@utilities/messages.ts";
import { Ollama } from "ollama";

export class OllamaClient {
  private constructor(
    public readonly api: Ollama,
    public readonly model: string,
  ) {}

  static async create({ url, model }: { url: string; model: string }): Promise<OllamaClient> {
    return await new OllamaClient(new Ollama({ host: url }), model).#prepare(model);
  }

  static async fromEnvironment(): Promise<OllamaClient> {
    return await this.create({ url: Environment.Ollama.Url, model: Environment.Ollama.Model });
  }

  async #prepare(model: string): Promise<this> {
    Logger.info({ "Model": model }, "[OllamaClient] [prepare] model preparing...");

    const stream = await this.api.pull({ model, stream: true });
    for await (const response of stream) {
      if (response.status === "success") {
        Logger.info("[OllamaClient] [prepare:success] model prepared.");
      } else {
        if (response.status === "pulling manifest" || !response.status.startsWith("pulling")) {
          Logger.info({ "Status": response.status }, "[OllamaClient] [prepare:progress]");
        } else {
          Logger.info({
            "Status": response.status,
            "Progress": `${Math.round(response.completed / response.total * 100)}%`,
          }, "[OllamaClient] [prepare:progress]");
        }
      }
    }

    return this;
  }

  async infer(
    { prompt, system }: { prompt: string; system?: string },
  ): Promise<{ response: string }> {
    return await this.api.generate({
      model: this.model,
      prompt: compactMessage(prompt),
      system: system ? compactMessage(system) : undefined,
    });
  }
}
