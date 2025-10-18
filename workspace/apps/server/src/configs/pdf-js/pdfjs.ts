import { readFileSync, writeFileSync } from "node:fs";
import { getDocument, type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Logger } from "../logger.ts";

let code = readFileSync("../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs", "utf-8");
if (!code.includes("(? - Unknown Array.random method)")) {
  Logger.debug("[PDFJS] Applying patch to pdf.worker.mjs.");

  code = code.replace(
    `throw new Error(buildMsg("Array", prop));`,
    `// throw new Error(buildMsg("Array", prop)); (? - Unknown Array.random method)`,
  );

  writeFileSync("../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs", code);
  Logger.info("[PDFJS:success] Applied patch to pdf.worker.mjs.");
} else {
  Logger.debug("[PDFJS:skip] Already applied patch to pdf.worker.mjs, skipping...");
}

const CMAP_URL = "../../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const STANDARD_FONT_DATA_URL = "../../../node_modules/pdfjs-dist/standard_fonts/";

interface TextItem {
  /** Text content */
  str: string;
  /** Text direction: 'ttb', 'ltr' or 'rtl' */
  dir: "ttb" | "ltr" | "rtl" | string;
  /** Transformation matrix */
  transform: number[];
  /** Width in device space */
  width: number;
  /** Height in device space */
  height: number;
  /** Font name used by PDF.js for converted font */
  fontName: string;
  /** Indicating if the text content is followed by a line-break */
  hasEOL: boolean;
}

export const readPdfDocument = async (buffer: ArrayBuffer): Promise<PDFDocumentProxy | undefined> =>
  await getDocument({
    data: buffer,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    verbosity: 0,
  }).promise;

export const stringifyPdfBuffer = async (buffer: ArrayBuffer): Promise<string | undefined> => {
  const document = await readPdfDocument(buffer);
  if (!document) return undefined;

  const contents = await Promise.all(Array.from({ length: document.numPages }, async (_, i) => {
    const page = await document.getPage(i + 1);

    return await page.getTextContent();
  }));

  const strs: string[] = [];
  for (const content of contents) {
    const linesGroups: Map<number, TextItem[]> = new Map();

    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;

      const height = Math.round(item.transform[5]);
      let line = linesGroups.get(height);

      if (!line) {
        line = [];
        linesGroups.set(height, line);
      }

      line.push(item);
    }

    const lines = linesGroups.entries().toArray()
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => items.sort((a, b) => a.transform[4] - b.transform[4]));

    for (const line of lines) {
      let str = "";
      let previous: TextItem | null = null;

      for (const item of line) {
        const text = item.str;

        if (previous) {
          const prevRight = previous.transform[4] + previous.width;
          const currentLeft = item.transform[4];
          const gap = currentLeft - prevRight;
          const avgCharWidth = previous.width / previous.str.length;

          if (gap > avgCharWidth * 0.3) {
            str += " ";
          }
        }

        str += text;
        previous = item;
      }

      strs.push(str);
    }
  }

  return strs.join("\n")
    .replace(/(\w+)-\n(\w+)/g, "$1$2")
    .replace(/  +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
