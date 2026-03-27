import type { components } from "@clients/auto/eli-api";

export type PublisherResource = components["schemas"]["PublishingHouse"];

export type ActResource = components["schemas"]["Act"];
export type YearResource = components["schemas"]["acts"];
export type YearItemResource = components["schemas"]["ActInfo"];

export type ActTextType = Exclude<components["schemas"]["ActText"]["type"], undefined>;

export type StatusInForce = components["schemas"]["StatusInForce"];
