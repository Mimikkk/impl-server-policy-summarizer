import { Environment } from "@configs/environment.ts";
import { HonoClient } from "../../clients/HonoClient.ts";

export class DocsGenerator {
  static new() {
    return new this();
  }

  async generate() {
    const document = HonoClient.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { version: "1.0.0", title: "Documentation" },
      servers: [{ url: `http://localhost:${Environment.Server.Port}`, description: "Local server" }],
    });

    if (document.components?.schemas) {
      document.components.schemas = Object.fromEntries(
        Object.entries(document.components.schemas).sort((a, b) => a[0].localeCompare(b[0])),
      );
    }

    return document;
  }
}
