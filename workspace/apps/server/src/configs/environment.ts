import { config } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import z from "zod";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: join(__dirname, "../../.env") });

const environmentSchema = z.object({
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
  EliDocsUrl: z.string().min(1).default("https://api.sejm.gov.pl/eli/openapi/"),
});

export interface Environment extends z.infer<typeof environmentSchema> {}

const env = process.env;
export const Environment = environmentSchema.parse({
  Server: {
    Host: env.HOST,
    Port: env.PORT != null && env.PORT !== "" ? Number(env.PORT) : undefined,
  },
  Logging: {
    Level: env.LOG_LEVEL,
  },
  Ollama: {
    Url: env.OLLAMA_URL,
    Model: env.OLLAMA_MODEL,
  },
  Database: {
    Url: env.DATABASE_URL,
  },
  EliDocsUrl: env.ELI_DOCS_URL,
});
