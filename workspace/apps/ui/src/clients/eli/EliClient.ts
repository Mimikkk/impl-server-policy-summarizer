import { Environment } from "@configs/Environment.ts";
import { adaptQuery } from "../../core/queries/adaptQuery.ts";
import { Client } from "../Client.ts";
import type { ActResource, ActTextType } from "./resources/ActResource.ts";
import type { PublisherResource } from "./resources/PublisherResource.ts";
import type { YearResource } from "./resources/YearResource.ts";

export namespace EliClient {
  export const client = Client.new({ url: Environment.Clients.EliUrl + "acts/" });
  export const publishers = () => client.api.get<PublisherResource[]>("").json();

  export interface PublisherParams {
    publisher: string;
  }
  export const publisher = ({ publisher }: PublisherParams) => client.api.get<PublisherResource>(`${publisher}`).json();

  export interface YearParams extends PublisherParams {
    year: number;
  }
  export const year = ({ publisher, year }: YearParams) => client.api.get<YearResource>(`${publisher}/${year}`).json();

  export interface ActParams {
    publisher: string;
    year: number;
    position: number;
  }
  export const act = async ({ publisher, year, position }: ActParams): Promise<ActResource> =>
    await client.api.get<ActResource>(`${publisher}/${year}/${position}`).json();

  /** content-type: application/pdf */
  export type PdfFile = File;
  export const pdfUrl = ({ publisher, year, position }: ActParams): string =>
    client.urlOf(`${publisher}/${year}/${position}/text.pdf`);

  export const pdf = async ({ publisher, year, position }: ActParams): Promise<PdfFile> => {
    const response = await client.api.get(`${publisher}/${year}/${position}/text.pdf`).blob();

    return new File([response], `${publisher}-${year}-${position}.pdf`, { type: "application/pdf" });
  };

  /** content-type: text/html; charset=utf-8 */
  export type HtmlFile = File;
  export const htmlUrl = ({ publisher, year, position }: ActParams): string =>
    client.urlOf(`${publisher}/${year}/${position}/text.html`);

  export const html = async (
    { publisher, year, position }: ActParams,
  ): Promise<HtmlFile> => {
    const response = await client.api.get(`${publisher}/${year}/${position}/text.html`).blob();

    return new File([response], `${publisher}-${year}-${position}.html`, { type: "text/html" });
  };

  export const htmlText = async (
    { publisher, year, position }: ActParams,
  ): Promise<string> => await client.api.get(`${publisher}/${year}/${position}/text.html`).text();

  /** content-type: text/html; charset=utf-8 */
  export type TextFile = File;
  export const textUrl = ({ publisher, year, position }: ActParams): string =>
    client.urlOf(`${publisher}/${year}/${position}/text.html`);

  export interface TextParams extends ActParams {
    type: ActTextType;
    fileName: string;
  }

  export const text = async ({ publisher, year, position, type, fileName }: TextParams): Promise<TextFile> => {
    const response = await client.api.get(`${publisher}/${year}/${position}/text/${type}/${fileName}`).text();

    return new File([response], `${publisher}-${year}-${position}.txt`, { type: "text/plain" });
  };
}

export const EliQuery = adaptQuery({
  prefix: "eli",
  client: EliClient,
  mutations: {},
  queries: {
    text: {},
    html: {},
    pdf: {},
    publishers: {},
    publisher: {},
    year: {},
    act: {},
  },
});
