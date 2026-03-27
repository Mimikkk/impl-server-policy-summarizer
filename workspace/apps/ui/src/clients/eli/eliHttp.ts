import type { paths } from "@clients/auto/eli-api";
import { Environment } from "@configs/Environment.ts";
import { TimeMs } from "@utilities/common.ts";
import createClient from "openapi-fetch";

export const eliHttp = createClient<paths>({
  baseUrl: Environment.Clients.EliUrl,
  fetch(input) {
    return fetch(input, { signal: AbortSignal.timeout(TimeMs.s30) });
  },
});
