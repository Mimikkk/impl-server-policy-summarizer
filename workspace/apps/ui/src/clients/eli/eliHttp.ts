import type { paths } from "@clients/auto/eli-api";
import { Environment } from "@configs/Environment.ts";
import { TimeMs } from "@utilities/common.ts";
import createClient from "openapi-fetch";

const fetchWithTimeout: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(TimeMs.s30) });

export const eliHttp = createClient<paths>({
  baseUrl: Environment.Clients.EliUrl.replace(/\/$/, ""),
  fetch: fetchWithTimeout,
});
