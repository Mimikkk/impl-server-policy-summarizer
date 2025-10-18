import { stringifyPdfBuffer } from "@configs/pdf-js/pdfjs.ts";
import { z } from "@hono/zod-openapi";
import { HonoClient } from "../../clients/HonoClient.ts";
import { defineResponses } from "../docs/defineResponses.ts";
import { SummaryResource } from "./pdfs.resource.ts";

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/summarize",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.union([
              z.object({
                content: z.string().min(1).describe("The content of the text"),
              }).openapi({
                title: "Text content",
                description: "The text content to summarize",
              }),
              z.object({
                url: z.url().describe("The url containing an pdf file."),
              }).openapi({
                title: "URL content",
                description: "The url containing an pdf file to extract text from.",
              }),
            ]),
            example: { content: "The text content to summarize" },
          },
        },
        description: "The request body",
        required: true,
      },
    },
    responses: defineResponses({
      200: {
        schema: SummaryResource.schema,
        description: "The summary of the text",
      },
      400: {
        schema: z.object({
          status: z.number().describe("The error code."),
          message: z.string().describe("The error message."),
        }).openapi("PDF Operations - Errors - UnprocessablePdfErrorResponse"),
        description: "Failed to parse the file",
      },
    }),
  },
  async (context) => {
    const values = context.req.valid("json");

    let content = "";
    if ("content" in values) {
      content = values.content;
    } else {
      try {
        const buffer = await fetch(values.url).then((res) => res.arrayBuffer());
        content = await stringifyPdfBuffer(buffer) ?? "";
      } catch {
        return context.json({ status: 400, message: "Failed to parse the file." }, 400);
      }
    }

    const { response: rawSummary } = await context.var.llm.infer({
      system: `\
        You are a text summarizer. You write clear, simple summaries that anyone can understand. You use only common everyday words. You avoid jargon, technical terms, and fancy language. You always write in the same language as the input text. You follow the exact output format requested without any deviation.

        Rules you must follow:
        - Write in the EXACT SAME LANGUAGE as the input text
        - Use only simple, common words (like a friend explaining to another friend)
        - No fancy words, no jargon, no technical terms
        - Be direct and clear
        - Count your words carefully to stay within limits


        --- OUTPUT FORMAT ---
        ###SHORT###
        [Write 20-40 words maximum. One or two sentences that capture the main point.]

        ###LONG###
        [Write 60-100 words maximum. A paragraph that explains the key information in more detail.]

        ###TAKEAWAYS###
        [Write 1-4 bullet points. Each point is one short sentence about a key fact or idea. Start each with a dash (-).]
        --- END

        Remember:
        - Use the same language as the input text
        - Use simple everyday words only
        - Follow the format exactly with the ### markers
        - Stay within word limits

        Task: Create three summaries of the text below.
        `,
      prompt: `Pamiętaj o zachowaniu języka polskiego: ${content}`,
    });

    // Parse the structured output
    const shortMatch = rawSummary.match(/###SHORT###\s*([\s\S]*?)(?=###LONG###|$)/);
    const longMatch = rawSummary.match(/###LONG###\s*([\s\S]*?)(?=###TAKEAWAYS###|$)/);
    const takeawaysMatch = rawSummary.match(/###TAKEAWAYS###\s*([\s\S]*?)$/);

    const short = shortMatch?.[1]?.trim() || "";
    const long = longMatch?.[1]?.trim() || "";
    const takeaways = takeawaysMatch?.[1]?.trim() || "";

    // Construct final summary with clear structure
    const summary = `SHORT SUMMARY:\n${short}\n\n\nDETAILED SUMMARY:\n${long}\n\n\nKEY TAKEAWAYS:\n${takeaways}`;

    const [entity] = await context.var.database.insert(SummaryResource.table).values({ content, summary: rawSummary })
      .returning();

    return context.json(entity, 200);
  },
);

HonoClient.openapi(
  {
    method: "post",
    path: "/api/v1/pdf-operations/extract-text",
    tags: ["PDF Operations"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({ url: z.url().describe("The url containing an pdf file.") }),
            example: { url: "https://pdfobject.com/pdf/sample.pdf" },
          },
        },
      },
    },
    responses: defineResponses({
      200: {
        schema: z.object({
          content: z.string().describe("The content of the file"),
        }).openapi("PDF Operations - Results - PdfContentResponse"),
        description: "The content of the file as text",
      },
      400: {
        schema: z.object({
          status: z.number().describe("The error code."),
          message: z.string().describe("The error message."),
        }).openapi("PDF Operations - Errors - UnprocessablePdfErrorResponse"),
        description: "Failed to parse the file",
      },
    }),
  },
  async (context) => {
    const { url } = context.req.valid("json") as { url: string };

    try {
      const buffer = await fetch(url).then((res) => res.arrayBuffer());
      const content = await stringifyPdfBuffer(buffer) ?? "";

      return context.json({ content }, 200);
    } catch {
      return context.json({ status: 400, message: "Failed to parse the file." }, 400);
    }
  },
);
