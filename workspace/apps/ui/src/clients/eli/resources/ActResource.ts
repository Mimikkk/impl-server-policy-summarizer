import type { DateString, DateTimeString } from "@core/types/common.ts";

export interface ActResource {
  /* Identifikator ELI */
  ELI: string;
  /* Adres */
  address: string;
  /* Data ogłoszenia */
  announcementDate: DateString;
  /* Data ostatniej zmiany */
  changeDate: DateTimeString;
  /* Adres do wyświetlenia */
  displayAddress: string;
  /* Pozycja aktu w roku */
  pos: number;
  /* Data wydania */
  promulgation: DateString;
  /** @see PublisherResource */
  publisher: string;
  status: string;
  textHTML: boolean;
  textPDF: boolean;
  title: string;
  type: string;
  volume: number;
  year: number;
  authorizedBody: unknown[];
  directives: ActDirective[];
  entryIntoForce: DateString;
  expirationDate: DateString;
  inForce: InForce;
  keywords: string[];
  keywordsNames: unknown[];
  obligated: unknown[];
  previousTitle: unknown[];
  prints: unknown[];
  references: Record<string, ActReference[]>;
  releasedBy: string[];
  texts: ActText[];
  validFrom: DateString;
}
/**
 * Typ tekstu
 */
export type ActTextType = "T" | "O" | "U" | "H" | "I";

export interface ActText {
  /* Nazwa pliku */
  fileName: string;
  /* Typ tekstu */
  type: ActTextType;
}

/** Status obowiązywania */
export enum InForce {
  Yes = "IN_FORCE",
  No = "NOT_IN_FORCE",
  Unknown = "UNKNOWN",
}

export interface ActDirective {
  /* Adres */
  address: string;
  /* Data */
  date: DateString;
  /* Tytuł */
  title: string;
}

export interface ActReference {
  /* Identifikator ELI */
  id: string;
  /** Data */
  date?: DateString;
  /** Który art.  */
  art?: string;
}
