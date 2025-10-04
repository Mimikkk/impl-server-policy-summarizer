export interface YearItemResource {
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

export interface YearResource {
  /** Liczba aktów w roku */
  totalCount: number;
  /** Indeks pierwszego aktu */
  offset: number;
  /** Liczba aktów w odpowiedzi */
  count: number;
  /** lista aktów */
  items: YearItemResource[];
}
