import { loadSync } from "@std/dotenv";
import z from "zod";

const raw = loadSync();

export const Environment = z.object({
  Server: z.object({
    Host: z.string().min(1).default("0.0.0.0"),
    Port: z.number().default(8080),
  }),
  Logging: z.object({
    Level: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  }),
  Ollama: z.object({
    Url: z.string().min(1).default("http://localhost:11434"),
    Model: z.string().min(1).default("deepseek-r1:8b"),
  }),
  Database: z.object({
    Url: z.string().min(1),
  }),
}).parse({
  Server: {
    Host: raw.HOST,
    Port: +raw.PORT,
  },
  Logging: {
    Level: raw.LOG_LEVEL,
  },
  Ollama: {
    Url: raw.OLLAMA_URL,
    Model: raw.OLLAMA_MODEL,
  },
  Database: {
    Url: raw.DATABASE_URL,
  },
});
