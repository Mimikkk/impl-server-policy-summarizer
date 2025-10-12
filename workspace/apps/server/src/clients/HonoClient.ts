import type { ContainerVariables } from "@configs/container.ts";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

export const HonoClient = new Hono<{ Variables: ContainerVariables }>()
  .use(logger(), etag(), cors(), prettyJSON())
  .use(async (context, next) => {
    context.set("logger", HonoClient.dependencies.logger);
    context.set("ollama", HonoClient.dependencies.ollama);

    await next();
  });

declare module "hono" {
  interface Hono {
    dependencies: ContainerVariables;
  }
}
