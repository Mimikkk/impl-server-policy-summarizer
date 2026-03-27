import type { paths } from "@clients/auto/server-api";
import { Environment } from "@configs/Environment.ts";
import { TimeMs } from "@utilities/common.ts";
import createClient from "openapi-fetch";

export const serverHttp = createClient<paths>({
  baseUrl: Environment.Clients.ServerUrl,
  fetch(input) {
    return fetch(input, { signal: AbortSignal.timeout(TimeMs.s30) });
  },
});
