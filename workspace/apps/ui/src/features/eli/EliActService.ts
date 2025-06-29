import ky from "ky";

/** @see {@link https://api.sejm.gov.pl/eli/openapi/ui/} */
export namespace EliActService {
  const url = "https://api.sejm.gov.pl/eli/acts";
  const api = ky.create({ prefixUrl: url });

  /** Dziennik ustaw
   * @see {@link https://dziennikustaw.gov.pl/DU}
   */
  export type Publisher = "DU";

  export interface ActParameters {
    publisher: Publisher;
    year: number;
    position: number;
  }

  export interface ActResponse {
  }

  export const details = async ({ publisher, year, position }: ActParameters): Promise<ActResponse> => {
    return await api.get<ActResponse>(`${publisher}/${year}/${position}`).json();
  };

  /** content-type: application/pdf */
  export type PdfFile = File;
  export const pdfUrl = ({ publisher, year, position }: ActParameters): string => {
    return `${url}/${publisher}/${year}/${position}/text.pdf`;
  };
  export const pdf = async ({ publisher, year, position }: ActParameters): Promise<PdfFile> => {
    const response = await api.get(`${publisher}/${year}/${position}/text.pdf`).blob();

    return new File([response], `${publisher}-${year}-${position}.pdf`, { type: "application/pdf" });
  };

  /** content-type: text/html; charset=utf-8 */
  export type HtmlFile = File;
  export const htmlUrl = ({ publisher, year, position }: ActParameters): string => {
    return `${url}/${publisher}/${year}/${position}/text.html`;
  };
  export const html = async ({ publisher, year, position }: ActParameters): Promise<HtmlFile> => {
    const response = await api.get(`${publisher}/${year}/${position}/text.html`).blob();

    return new File([response], `${publisher}-${year}-${position}.html`, { type: "text/html" });
  };

  /** content-type: text/html; charset=utf-8 */
  export type TextFile = File;
  export const textUrl = ({ publisher, year, position }: ActParameters): string => {
    return `${url}/${publisher}/${year}/${position}/text.html`;
  };
  export const text = async ({ publisher, year, position }: ActParameters): Promise<TextFile> => {
    const response = await api.get(`${publisher}/${year}/${position}/text`).text();

    return new File([response], `${publisher}-${year}-${position}.txt`, { type: "text/plain" });
  };
}
