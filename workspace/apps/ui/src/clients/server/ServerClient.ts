import { Environment } from "@configs/Environment.ts";
import { adaptQuery } from "@core/queries/adaptQuery.ts";
import { TimeMs } from "@utilities/common.ts";
import { Client } from "../Client.ts";
import type { SummaryResource } from "./resources/SummaryResource.ts";

export namespace ServerClient {
  export const client = Client.new({ url: Environment.Clients.ServerUrl });

  export const summarize = async (values: { content: string } | { url: string }): Promise<SummaryResource> => {
    const response = await client.api.post("api/v1/pdf-operations/summarize", { json: values, timeout: TimeMs.s30 });

    return response.json();
  };

  export const csv = async (file: File): Promise<Record<string, string>[]> => {
    const formData = new FormData();
    formData.append("file", file);

    /* @ts-expect-error - multipart/form-data is not supported in ky types */
    const response = await client.api.post("api/v1/csv-operations/contents", { body: formData, timeout: TimeMs.s30 });

    return response.json();
  };
}

export const ServerQuery = adaptQuery({
  prefix: "server",
  client: ServerClient,
  mutations: {},
  queries: {
    summarize: {},
    csv: {},
  },
});
