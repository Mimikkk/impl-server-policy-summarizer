import type { components } from "@clients/auto/server-api.ts";
import { adaptQuery } from "@core/queries/adaptQuery.ts";
import { serverHttp } from "./serverHttp.ts";
import type {
  ExportCsvPayload,
  RegeneratePayload,
  TranslatePayload,
  Verification,
  VerifyPayload,
} from "./serverTypes.ts";

const unwrap = (result: { data?: unknown; error?: unknown }): unknown => {
  if (result.error != null) throw result.error;
  if (result.data === undefined) throw new Error("Empty response");
  return result.data;
};

export namespace ServerClient {
  export const summarize = async (values: {
    url: string;
  }): Promise<components["schemas"]["Resources - TextSummaryResource"]> => {
    return unwrap(
      await serverHttp.POST("/api/v1/pdf-operations/summarize", { body: values }),
    ) as components["schemas"]["Resources - TextSummaryResource"];
  };

  export const importCsv = async (file: File): Promise<Record<string, string>[]> => {
    const body = new FormData();
    body.append("file", file);
    return unwrap(
      await serverHttp.POST("/api/v1/csv-operations/import", {
        body: body as never,
      }),
    ) as Record<string, string>[];
  };

  export const exportCsv = async (payload: ExportCsvPayload): Promise<File> => {
    const csv = unwrap(await serverHttp.POST("/api/v1/csv-operations/export", { body: payload })) as string;
    return new File([csv], "export.csv", { type: "text/csv" });
  };

  export const translate = async (payload: TranslatePayload) => {
    return unwrap(await serverHttp.POST("/api/v1/translations/translate", { body: payload })) as {
      translations: { translation: string }[];
    };
  };

  export const regenerate = async (payload: RegeneratePayload) => {
    return unwrap(await serverHttp.POST("/api/v1/translations/regenerate", { body: payload })) as {
      translations: { translation: string }[];
    };
  };

  export const verify = async (payload: VerifyPayload): Promise<Verification> => {
    return unwrap(await serverHttp.POST("/api/v1/translations/verify", { body: payload })) as Verification;
  };
}

export type { ExportCsvPayload } from "./serverTypes.ts";

export const ServerQuery = adaptQuery({
  prefix: "server",
  client: ServerClient,
  mutations: {},
  queries: {
    summarize: {},
    importCsv: {},
    exportCsv: {},
  },
});
