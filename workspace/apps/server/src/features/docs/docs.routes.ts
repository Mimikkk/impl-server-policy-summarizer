import { Environment } from "@configs/environment.ts";
import { Scalar } from "@scalar/hono-api-reference";
import { HonoClient } from "../../clients/HonoClient.ts";

HonoClient.get("/docs/openapi.json", (context) => {
  const document = HonoClient.getOpenAPI31Document({
    openapi: "3.1.0",
    info: { version: "1.0.0", title: "Documentation" },
    security: [],
    servers: [{
      url: `http://localhost:${Environment.Server.Port}`,
      description: "Local server",
    }],
  });

  if (document.components?.schemas) {
    document.components.schemas = Object.fromEntries(
      Object.entries(document.components.schemas).sort((a, b) => a[0].localeCompare(b[0])),
    );
  }

  return context.json(document, 200);
});

HonoClient.get("/docs/ui", Scalar({ url: "/docs/openapi.json" }));
