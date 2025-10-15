import pino from "pino";
import pinoPretty from "pino-pretty";
import { Environment } from "./environment.ts";

export const Logger = pino(
  {
    level: Environment.Logging.Level,
    timestamp: true,
  },
  pinoPretty({
    levelFirst: true,
    ignore: "pid,hostname",
    translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
  }),
);

Logger.info({
  "Logging Level": Environment.Logging.Level,
}, "[Logger] initialized.");
