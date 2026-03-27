import { Environment } from "@configs/environment.ts";
import { Scalar } from "@scalar/hono-api-reference";
import { HonoClient } from "../../clients/HonoClient.ts";
import { DocsGenerator } from "./docs.generator.ts";

const apiDocsUrl = "/docs/openapi.json";
HonoClient.get(apiDocsUrl, async (context) => {
  const document = await DocsGenerator.new().generate();

  return context.json(document, 200);
});

HonoClient.get("/docs/ui", Scalar({ url: apiDocsUrl }));
HonoClient.get("/docs/eli-ui", Scalar({ url: Environment.EliDocsUrl }));
