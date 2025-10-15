import { Environment } from "@configs/environment.ts";
import { Logger } from "@configs/logger.ts";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

const db = createClient({ url: Environment.Database.Url });

export const DrizzleClient = drizzle({
  client: db,
  schema: {},
});

const { version } = await DrizzleClient.get<{ version: string }>(
  sql`select sqlite_version() as version`,
);
Logger.info({
  "LibSQL Version": version,
  "Drizzle Version": DrizzleClient,
  "Database URL": Environment.Database.Url,
}, "[DrizzleClient] initialized.");
