import { Environment } from "@configs/environment.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { HonoClient } from "../clients/HonoClient.ts";

HonoClient.doc31("/documentation/openapi.json", {
  openapi: "3.1.0",
  info: { version: "1.0.0", title: "My API" },
  security: [],
  servers: [{ url: `http://${Environment.Server.Host}:${Environment.Server.Port}` }],
});

HonoClient.get(
  "/documentation/ui",
  swaggerUI({ url: "/documentation/openapi.json" }),
);
