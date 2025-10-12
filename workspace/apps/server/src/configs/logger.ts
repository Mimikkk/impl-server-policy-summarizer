import pino from "pino";
import pinoPretty from "pino-pretty";
import { Environment } from "./environment.ts";

export const Logger = pino(
  {
    useOnlyCustomLevels: false,
    level: Environment.Logging.Level,
    timestamp: true,
  },
  pinoPretty({
    singleLine: true,
    levelFirst: true,
    ignore: "pid,hostname",
    translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
  }),
);

Logger.info(`Logger initialized with level: "${Environment.Logging.Level}".`);
