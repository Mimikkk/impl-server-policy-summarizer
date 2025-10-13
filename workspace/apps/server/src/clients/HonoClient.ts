import { type Container, container } from "@configs/container.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { internalServerErrors, notFoundErrors } from "../core/messages/errors.ts";

export const HonoClient = new OpenAPIHono<{ Variables: Container }>();

HonoClient
  .use(
    logger(),
    etag(),
    cors(),
    prettyJSON(),
  )
  .use(async (context, next) => {
    context.set("logger", container.logger);
    context.set("ollama", container.ollama);

    await next();
  })
  .notFound(notFoundErrors)
  .onError(internalServerErrors);
