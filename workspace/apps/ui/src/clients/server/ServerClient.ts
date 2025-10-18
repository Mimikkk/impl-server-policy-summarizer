import { Environment } from "@configs/Environment.ts";
import { TimeMs } from "@utilities/common.ts";
import { Client } from "../Client.ts";
import type { SummaryResource } from "./resources/SummaryResource.ts";

export namespace ServerClient {
  export const client = Client.new({ url: Environment.Clients.ServerUrl });

  export const summarize = async (values: { content: string } | { url: string }): Promise<SummaryResource> => {
    const response = await client.api.post("api/v1/pdf-operations/summarize", {
      json: values,
      timeout: TimeMs.s30,
    });
    console.log({ response });
    return response.json();
  };
}
