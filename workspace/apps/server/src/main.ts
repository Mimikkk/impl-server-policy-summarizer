import { createContainerVariables } from "@configs/container.ts";
import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { HonoClient } from "./clients/HonoClient.ts";

const controller = new AbortController();
const { signal } = controller;

HonoClient.dependencies = await createContainerVariables();

Deno.serve({
  onListen() {
    Logger.info(`Server is running on "http://${Environment.Server.Host}:${Environment.Server.Port}".`);

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
