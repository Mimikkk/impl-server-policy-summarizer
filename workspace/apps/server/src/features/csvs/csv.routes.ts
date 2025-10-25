import { z } from "@hono/zod-openapi";
import { parseString } from "fast-csv";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/csv-operations/contents",
    tags: ["CSV Operations"],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({ file: z.instanceof(File).openapi({ type: "string", format: "binary" }) }).openapi({
              title: "CSVContents",
              description: "The contents of the CSV file",
            }),
            example: { file: new File([], "test.csv") },
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        schema: z.array(z.record(z.string(), z.string())).openapi({
          example: [{ value1: "value1", value2: "value2" }],
        }),
        description: "The contents of the CSV file",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const form = await context.req.formData();
    const file = form.get("file") as File;

    context.var.logger.debug(`[CSVService] Parsing CSV file: ${file.name}.`);

    if (!file) return context.json({ status: 422, message: "Missing file" }, 422);

    const contents = await parseCsv(file);
    return context.json(contents, 200);
  },
);

export const parseCsv = async (file: File): Promise<Record<string, string>[]> => {
  const { promise, reject, resolve } = Promise.withResolvers<Record<string, string>[]>();

  const rows: Record<string, string>[] = [];
  parseString(await file.text(), { headers: true })
    .on("error", reject)
    .on("data", (row) => rows.push(row))
    .on("end", () => resolve(rows));

  return await promise;
};
