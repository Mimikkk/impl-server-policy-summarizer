import { Environment } from "@configs/environment.ts";
import { Scalar } from "@scalar/hono-api-reference";
import { HonoClient } from "../../clients/HonoClient.ts";

HonoClient.doc31("/docs/openapi.json", {
  openapi: "3.1.0",
  info: { version: "1.0.0", title: "Documentation" },
  security: [],
  servers: [{
    url: `http://localhost:${Environment.Server.Port}`,
    description: "Local server",
  }],
});

HonoClient.get(
  "/docs/ui",
  Scalar({ url: "/docs/openapi.json" }),
);
