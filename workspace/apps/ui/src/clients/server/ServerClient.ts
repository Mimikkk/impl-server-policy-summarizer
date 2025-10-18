import { Environment } from "@configs/Environment.ts";
import { Client } from "../Client.ts";
import type { SummaryResource } from "./resources/SummaryResource.ts";

export namespace ServerClient {
  export const client = Client.new({ url: Environment.Clients.ServerUrl });

  export const summarize = async (values: { content: string } | { url: string }): Promise<SummaryResource> => {
    const response = await client.api.post("api/v1/pdf-operations/summarize/", { json: values });
    console.log({ response });
    return response.json();
  };
}
