import type { Container } from "@configs/container.ts";
import { stringifyPdfBuffer } from "@configs/pdf-js/pdfjs.ts";
import { and, eq } from "drizzle-orm";
import { type TextExtraction, TextExtractionResource, type TextSummary, TextSummaryResource } from "./pdfs.resource.ts";

export class PdfService {
  static new({ database, llm }: Pick<Container, "database" | "llm">): PdfService {
    return new PdfService(database, llm);
  }

  private constructor(
    private readonly database: Container["database"],
    private readonly llm: Container["llm"],
  ) {}

  async extract({ type, ref }: TextSource): Promise<TextExtraction | undefined> {
    let entity = await this.database.select()
      .from(TextExtractionResource.table)
      .where(and(eq(TextExtractionResource.table.sourceType, type), eq(TextExtractionResource.table.sourceRef, ref)))
      .get();
    if (entity) return entity;

    const buffer = await fetch(ref).then((response) => response.arrayBuffer()).catch(() => undefined);
    if (!buffer) return undefined;

    const content = await stringifyPdfBuffer(buffer);
    if (!content) return undefined;

    entity = await this.database.insert(TextExtractionResource.table).values({
      sourceType: type,
      sourceRef: ref,
      content,
    }).returning().get();

    return entity;
  }
  static #summaryFormat = {
    type: "object",
    properties: {
      summary: { type: "string" },
      details: { type: "string" },
      takeaways: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "details", "takeaways"],
  };
  static #summarySchema = TextSummaryResource.schema.pick({ summary: true, details: true, takeaways: true });
  async summarize(extraction: TextExtraction): Promise<TextSummary | undefined> {
    if (!extraction) return undefined;

    const entity = await this.database.select()
      .from(TextSummaryResource.table)
      .where(eq(TextSummaryResource.table.textExtractionId, extraction.id))
      .get();
    if (entity) return entity;

    let retries = 5;
    while (retries-- > 0) {
      const { response } = await this.llm.infer({
        format: PdfService.#summaryFormat,
        system: `\
        You are a text summarizer. You write clear, simple summaries that anyone can understand.
        If you are not able to write the summaries, you should return an empty string.
        If you are wrong you will be penalized and beaten.

        Rules you must follow:
        - Output dates in the format YYYY-MM-DD.
        - Write in the EXACT SAME LANGUAGE as the input text.
        - Use only conversational words (like a friend explaining to another friend).
        - Be direct and clear, not technical.

        Task: Create three summaries of the text below. Respone in JSON format.
        ---
        # Summary
        20-40 words. One or two sentences that capture the main point.
        
        # Details
        60-100 words. A paragraph that explains the key information in more detail.
 
        # Takeaways
        1-4 bullet points. Each point is one short sentence about a key fact or idea. Start each with a dash (-).
        ---

        Od teraz pisz w języku polskim.
        `,
        prompt: extraction.content,
      });

      const { success, data } = PdfService.#summarySchema.safeParse(JSON.parse(response));
      if (!success) continue;

      return await this.database.insert(TextSummaryResource.table).values({
        textExtractionId: extraction.id,
        details: data.details,
        summary: data.summary,
        takeaways: data.takeaways,
      }).returning().get();
    }

    return undefined;
  }

  async extraction(id: string): Promise<TextExtraction | undefined> {
    return await this.database.select()
      .from(TextExtractionResource.table)
      .where(eq(TextExtractionResource.table.id, id))
      .get();
  }

  async summary(id: string): Promise<TextSummary | undefined> {
    return await this.database.select()
      .from(TextSummaryResource.table)
      .where(eq(TextSummaryResource.table.textExtractionId, id))
      .get();
  }
}

export type TextSource = { type: "url"; ref: string };
