import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const url = "https://api.sejm.gov.pl/eli/openapi";
const response = await fetch(url);
if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
const document = await response.text();

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const outPath = join(scriptDir, "../../ui/openapi/eli.openapi.yaml");

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, document, "utf8");

console.log(`Wrote ${outPath}`);
