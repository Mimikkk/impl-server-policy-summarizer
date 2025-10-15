import { type Container, container } from "@configs/container.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { TimeMs } from "@utilities/TimeMs.ts";
import type { Context as HonoContext } from "hono";
import { cache } from "hono/cache";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { timeout } from "hono/timeout";
import {
  withCacheMonitor,
  withInternalServerErrors,
  withRequestMonitor,
  withRouteNotFoundErrors,
  withValidationErrors,
} from "../core/middlewares.ts";

export const HonoClient = new OpenAPIHono<{ Variables: Container }>({ defaultHook: withValidationErrors });

HonoClient
  .use(
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["ETag"],
      credentials: false,
      maxAge: 600,
    }),
    logger(),
    etag(),
    timeout(TimeMs.s5),
    prettyJSON(),
  )
  .use(async (context, next) => {
    context.set("logger", container.logger);
    context.set("monitoring", container.monitoring);

    await next();
  })
  .use(withRequestMonitor())
  .get(
    "*",
    except(
      ["api/v1/metrics/*", "/docs/*"],
      cache({ cacheName: "cache", wait: true, cacheControl: "max-age=3600" }),
      withCacheMonitor(),
    ),
  )
  .use(async (context, next) => {
    context.set("ollama", container.ollama);

    await next();
  })
  .notFound(withRouteNotFoundErrors)
  .onError(withInternalServerErrors);

export type Context = HonoContext<{ Variables: Container }, string, {}>;
