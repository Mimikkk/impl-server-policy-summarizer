import ky from "ky";

/** @see {@link https://api.sejm.gov.pl/eli/openapi/ui/} */
export namespace EliActService {
  const url = "https://api.sejm.gov.pl/eli/acts";
  const api = ky.create({ prefixUrl: url });

  export interface PublisherDetails {
    /** liczba aktów */
    actsCount: number;
    /** Kod wydawnictwa */
    code: string;
    /** Nazwa wydawnictwa */
    name: string;
    /** Skrócona nazwa wydawnictwa */
    shortName: string;
    /** Lista lat w których były akty  */
    years: number[];
  }

  export const publishers = () => api.get<PublisherDetails[]>("").json();

  export interface PublisherParameters {
    publisher: string;
  }

  export const publisher = ({ publisher }: PublisherParameters) =>
    api.get<PublisherDetails>(`publishers/${publisher}`).json();

  export interface YearItem {
    /** Identifikator ELI  */
    ELI: string;
    /** Symbol wydawnictwa */
    address: string;
    /** Rok wydania */
    year: number;
    /** Nr zeszytu */
    volume: number;
    /** Pozycja aktu w roku */
    pos: number;
    /** Tytuł aktu */
    title: string;
    /** Adres do wyświetlenia */
    displayAddress: string;
    /** Data wydania */
    promulgation: string;
    /** Data ogłoszenia */
    announcementDate: string;
    /** Czy akt ma tekst w postaci PDF */
    textPDF: boolean;
    /** Czy akt ma tekst w postaci HTML */
    textHTML: boolean;
    /** Data ostatniej zmiany */
    changeDate: string;
    /** Typ aktu */
    type: string;
    /** Status obowiązywania */
    status: string;
  }

  export interface YearResponse {
    /** Liczba aktów w roku */
    totalCount: number;
    /** Indeks pierwszego aktu */
    offset: number;
    /** Liczba aktów w odpowiedzi */
    count: number;
    /** lista aktów */
    items: YearItem[];
  }

  export interface YearParameters extends PublisherParameters {
    year: number;
  }

  export const year = ({ publisher, year }: YearParameters) =>
    api.get<PublisherDetails>(`publishers/${publisher}/${year}`).json();

  export interface ActParameters {
    publisher: string;
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
