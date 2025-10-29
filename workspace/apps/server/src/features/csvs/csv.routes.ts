import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/csv-operations/import",
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

    const contents = await context.var.services.csvs.importCsv(file);
    if (!contents) return context.json({ status: 422, message: "Failed to import CSV file" }, 422);

    return context.json(contents, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/csv-operations/export",
    tags: ["CSV Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              headers: z.record(z.string(), z.string()).openapi({
                description: "Mapping of column keys to display names",
                example: { firstName: "First Name", lastName: "Last Name" },
              }),
              data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).openapi({
                description: "Array of data rows matching the header keys",
                example: [
                  { firstName: "John", lastName: "Doe" },
                  { firstName: "Jane", lastName: "Smith" },
                ],
              }),
            }).openapi({
              title: "ExportCSVRequest",
              description: "Request to create a CSV file from JSON data",
            }),
          },
        },
      },
    },
    responses: defineResponses((c) => ({
      200: {
        type: "text/csv",
        schema: z.string().openapi({ example: "name,age\nJohn,30\nJane,25", description: "The CSV file content" }),
        description: "Successfully generated CSV file",
      },
      422: c.common.unprocessable,
    })),
  },
  async (context) => {
    const body = await context.req.json();
    const { headers, data } = body;

    context.var.logger.debug(
      `[CSVService] Creating CSV with ${Object.keys(headers).length} columns and ${data.length} rows.`,
    );

    if (!headers || !data) {
      return context.json({ status: 422, message: "Missing headers or data" }, 422);
    }

    const csvContent = await context.var.services.csvs.exportCsv(headers, data);
    if (!csvContent) return context.json({ status: 422, message: "Failed to export CSV file" }, 422);

    return context.body(csvContent, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="export.csv"',
    });
  },
);
