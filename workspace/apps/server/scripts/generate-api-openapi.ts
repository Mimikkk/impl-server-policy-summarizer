import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import "../src/api.routes.ts";

import { DocsGenerator } from "../src/features/docs/docs.generator.ts";

const document = await DocsGenerator.new().generate();

const directory = fileURLToPath(new URL(".", import.meta.url));
const outputPath = join(directory, "../../ui/openapi/server.openapi.json");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

console.info(`Wrote ${outputPath}`);
