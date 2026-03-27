import { adaptQuery } from "@core/queries/adaptQuery.ts";
import { Environment } from "@configs/Environment.ts";
import { TimeMs } from "@utilities/common.ts";
import { eliHttp } from "./eliHttp.ts";
import type { ActResource, ActTextType, PublisherResource, YearResource } from "./eliTypes.ts";

const unwrap = (result: { data?: unknown; error?: unknown }): unknown => {
  if (result.error != null) throw result.error;
  if (result.data === undefined) throw new Error("Empty response");
  return result.data;
};

const eliBase = (): string => Environment.Clients.EliUrl.replace(/\/$/, "");

const fetchActAsset = async (path: string): Promise<Response> => {
  const res = await fetch(`${eliBase()}${path}`, { signal: AbortSignal.timeout(TimeMs.s30) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
};

export namespace EliClient {
  export const publishers = async (): Promise<PublisherResource[]> => {
    return unwrap(await eliHttp.GET("/acts", {})) as PublisherResource[];
  };

  export interface PublisherParams {
    publisher: string;
  }
  export const publisher = async ({ publisher }: PublisherParams): Promise<PublisherResource> => {
    return unwrap(
      await eliHttp.GET("/acts/{publisher}", { params: { path: { publisher } } }),
    ) as PublisherResource;
  };

  export interface YearParams extends PublisherParams {
    year: number;
  }
  export const year = async ({ publisher, year }: YearParams): Promise<YearResource> => {
    return unwrap(
      await eliHttp.GET("/acts/{publisher}/{year}", { params: { path: { publisher, year } } }),
    ) as YearResource;
  };

  export interface ActParams {
    publisher: string;
    year: number;
    position: number;
  }
  export const act = async ({ publisher, year, position }: ActParams): Promise<ActResource> => {
    return unwrap(
      await eliHttp.GET("/acts/{publisher}/{year}/{position}", {
        params: { path: { publisher, year, position } },
      }),
    ) as ActResource;
  };

  /** content-type: application/pdf */
  export type PdfFile = File;
  export const pdfUrl = ({ publisher, year, position }: ActParams): string =>
    `${eliBase()}/acts/${publisher}/${year}/${position}/text.pdf`;

  export const pdf = async ({ publisher, year, position }: ActParams): Promise<PdfFile> => {
    const res = await fetchActAsset(`/acts/${publisher}/${year}/${position}/text.pdf`);
    const blob = await res.blob();
    return new File([blob], `${publisher}-${year}-${position}.pdf`, { type: "application/pdf" });
  };

  /** content-type: text/html; charset=utf-8 */
  export type HtmlFile = File;
  export const htmlUrl = ({ publisher, year, position }: ActParams): string =>
    `${eliBase()}/acts/${publisher}/${year}/${position}/text.html`;

  export const html = async ({ publisher, year, position }: ActParams): Promise<HtmlFile> => {
    const res = await fetchActAsset(`/acts/${publisher}/${year}/${position}/text.html`);
    const blob = await res.blob();
    return new File([blob], `${publisher}-${year}-${position}.html`, { type: "text/html" });
  };

  export const htmlText = async ({ publisher, year, position }: ActParams): Promise<string> => {
    const res = await fetchActAsset(`/acts/${publisher}/${year}/${position}/text.html`);
    return await res.text();
  };

  /** content-type: text/html; charset=utf-8 */
  export type TextFile = File;
  export const textUrl = ({ publisher, year, position }: ActParams): string =>
    `${eliBase()}/acts/${publisher}/${year}/${position}/text.html`;

  export interface TextParams extends ActParams {
    type: ActTextType;
    fileName: string;
  }

  export const text = async ({ publisher, year, position, type, fileName }: TextParams): Promise<TextFile> => {
    const res = await fetchActAsset(`/acts/${publisher}/${year}/${position}/text/${type}/${fileName}`);
    const body = await res.text();
    return new File([body], `${publisher}-${year}-${position}.txt`, { type: "text/plain" });
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
