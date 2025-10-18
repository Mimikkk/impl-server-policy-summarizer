import { Environment } from "@configs/Environment.ts";
import { Client } from "../Client.ts";
import type { SummaryResource } from "./resources/SummaryResource.ts";

export namespace ServerClient {
  export const client = Client.new({ url: Environment.Clients.ServerUrl });

  export const summarize = async (content: string): Promise<SummaryResource> =>
    await client.api.post("/api/v1/summarize", { json: { content } }).json();
}
