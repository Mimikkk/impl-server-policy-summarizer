import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { createClient } from "@libsql/client";
import { schema } from "@persistence/schema.ts";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createRequire } from "node:module";
const { pushSQLiteSchema } = createRequire(import.meta.url)(
  "drizzle-kit/api",
) as typeof import("drizzle-kit/api");

const db = createClient({ url: Environment.Database.Url });

export const DrizzleClient = drizzle({
  client: db,
  schema,
});

Logger.info("[DrizzleClient] pushing schema to database...");
const { hasDataLoss, warnings } = await pushSQLiteSchema(schema, DrizzleClient);

if (hasDataLoss) {
  Logger.error(warnings, "[DrizzleClient] data loss detected.");
} else if (warnings.length > 0) {
  Logger.warn(warnings, "[DrizzleClient] warnings detected.");
}

const { version } = await DrizzleClient.get<{ version: string }>(
  sql`select sqlite_version() as version`,
);

Logger.info({
  "LibSQL Version": version,
  "Database URL": Environment.Database.Url,
}, "[DrizzleClient] initialized.");
