import { EliResource } from "@features/eli/eli.resources.ts";
import { TextExtractionResource, TextSummaryResource } from "@features/pdfs-operations/pdfs.resource.ts";

export const schema = {
  extractions: TextExtractionResource.table,
  summaries: TextSummaryResource.table,
  eli: EliResource.table,
};
