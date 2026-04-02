import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { compactMessage } from "@utilities/messages.ts";
import { Ollama } from "ollama";

const PullIntervalMs = 2000;

function layerPullPercent(status: string, completed: unknown, total: unknown): number | undefined {
  const isBlobLayer = status.startsWith("pulling") && status !== "pulling manifest";
  if (!isBlobLayer || typeof completed !== "number" || typeof total !== "number" || total <= 0) {
    return undefined;
  }
  return Math.round((completed / total) * 100);
}

type PullProgressLogCursor = { lastStatus: string | undefined; lastEmitMs: number };
function shouldEmitPullProgress(cursor: PullProgressLogCursor, status: string, now: number): boolean {
  return status !== cursor.lastStatus || now - cursor.lastEmitMs >= PullIntervalMs;
}

interface InferOptions {
  prompt: string;
  system?: string;
  format?: object;
}

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
    Logger.info({ Model: model }, "[OllamaClient] [prepare] model preparing...");

    const stream = await this.api.pull({ model, stream: true });
    const log: PullProgressLogCursor = { lastStatus: undefined, lastEmitMs: 0 };

    for await (const response of stream) {
      if (response.status === "success") {
        Logger.info("[OllamaClient] [prepare:success] model prepared.");
        continue;
      }

      const status = response.status;
      const now = Date.now();
      if (!shouldEmitPullProgress(log, status, now)) {
        continue;
      }

      log.lastStatus = status;
      log.lastEmitMs = now;
      const progress = layerPullPercent(status, response.completed, response.total);
      Logger.info(
        progress === undefined ? { Status: status } : { Status: status, Progress: `${progress}%` },
        "[OllamaClient] [prepare:progress]",
      );
    }

    return this;
  }

  async infer({ prompt, system, format }: InferOptions): Promise<{ response: string }> {
    return await this.api.generate({
      model: this.model,
      prompt: compactMessage(prompt),
      system: system ? compactMessage(system) : undefined,
      format,
    });
  }

  async *stream({ prompt, system, format }: InferOptions): AsyncGenerator<string, void, unknown> {
    const stream = await this.api.generate({
      model: this.model,
      prompt: compactMessage(prompt),
      system: system ? compactMessage(system) : undefined,
      format,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.response) {
        yield chunk.response;
      }
    }
  }
}
