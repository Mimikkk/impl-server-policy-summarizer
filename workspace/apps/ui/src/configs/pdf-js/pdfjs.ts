import { useQuery } from "@tanstack/react-query";
import type * as PdfJs from "pdfjs-dist";
import { memo, type PropsWithChildren } from "react";

let instance: typeof PdfJs | null = null;
export const PdfJsProvider = memo(({ children }: PropsWithChildren) => {
  const { isSuccess } = useQuery({
    queryKey: ["load-dependency", "pdfjs"],
    queryFn: () =>
      import("pdfjs-dist/webpack.mjs").then((lib) => {
        instance = lib;
        return lib;
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return isSuccess ? children : null;
});

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

export const readPdf = async (file: File): Promise<PdfJs.PDFDocumentProxy | undefined> => {
  const buffer = await file.arrayBuffer();
  const pdf = await instance?.getDocument(buffer).promise;
  return pdf;
};

export const readPdfText = async (file: File): Promise<string | undefined> => {
  const pdf = await readPdf(file);
  if (!pdf) return undefined;

  const contents = await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => {
    const page = await pdf.getPage(i + 1);

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
