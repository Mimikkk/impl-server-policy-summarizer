import { EliResource } from "@features/eli/eli.resources.ts";
import { SummaryResource } from "@features/pdfs/pdfs.resource.ts";

export const schema = {
  summaries: SummaryResource.table,
  eli: EliResource.table,
};
