import type { components, paths } from "@clients/auto/server-api";

export type SummaryResource = components["schemas"]["Resources - TextSummaryResource"];

export type TranslatePayload = NonNullable<
  paths["/api/v1/translations/translate"]["post"]["requestBody"]
>["content"]["application/json"];

export type TranslationSample = NonNullable<TranslatePayload["samples"]>[number];

export type Translation =
  paths["/api/v1/translations/translate"]["post"]["responses"]["200"]["content"]["application/json"]["translations"][number];

export type RegeneratePayload = NonNullable<
  paths["/api/v1/translations/regenerate"]["post"]["requestBody"]
>["content"]["application/json"];

export type VerifyPayload = NonNullable<
  paths["/api/v1/translations/verify"]["post"]["requestBody"]
>["content"]["application/json"];

export type Verification =
  paths["/api/v1/translations/verify"]["post"]["responses"]["200"]["content"]["application/json"];

export type ExportCsvPayload = NonNullable<
  paths["/api/v1/csv-operations/export"]["post"]["requestBody"]
>["content"]["application/json"];
