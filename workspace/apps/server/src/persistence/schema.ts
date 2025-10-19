import { EliResource } from "@features/eli/eli.resources.ts";
import { TextExtractionResource, TextSummaryResource } from "@features/pdfs/pdfs.resource.ts";

export const schema = {
  extractions: TextExtractionResource.table,
  summaries: TextSummaryResource.table,
  eli: EliResource.table,
};
