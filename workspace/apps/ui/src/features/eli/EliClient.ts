import { ClientUrl } from "@configs/ClientUrls.ts";
import ky, { type KyInstance } from "ky";
import { adaptQuery } from "../../core/queries/adaptQuery.ts";
import type { ActResource } from "./resources/ActResource.ts";
import type { PublisherResource } from "./resources/PublisherResource.ts";
import type { YearResource } from "./resources/YearResource.ts";

interface ClientOptions {
  url: string;
}

export class Client {
  static new(options: ClientOptions) {
    return new Client(options.url, ky.create({ prefixUrl: options.url }));
  }

  private constructor(
    private readonly url: string,
    public readonly api: KyInstance,
  ) {}

  urlOf(path: string): string {
    return `${this.url}/${path}`;
  }
}

export namespace EliClient {
  export const client = Client.new({ url: ClientUrl.Eli });
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
  export const act = async ({ publisher, year, position }: ActParams): Promise<ActResource> => {
    return await client.api.get<ActResource>(`${publisher}/${year}/${position}`).json();
  };

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

  export const text = async ({ publisher, year, position }: ActParams): Promise<TextFile> => {
    const response = await client.api.get(`${publisher}/${year}/${position}/text`).text();

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
