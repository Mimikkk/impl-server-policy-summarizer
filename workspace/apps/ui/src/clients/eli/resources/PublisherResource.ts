export interface PublisherResource {
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
