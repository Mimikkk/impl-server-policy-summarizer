import { Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono({}).use(etag(), cors(), logger(), prettyJSON());

app.get("/", (c) => c.json({ message: "Hello, world!" }));

export default app;
