import type { Container } from "@configs/container.ts";
import { format, parseString } from "fast-csv";

export class CsvService {
  static new({ logger }: Pick<Container, "logger">): CsvService {
    return new CsvService(logger);
  }

  private constructor(
    private readonly logger: Container["logger"],
  ) {}

  async importCsv(file: File): Promise<Record<string, string>[] | undefined> {
    const { promise, resolve } = Promise.withResolvers<Record<string, string>[] | undefined>();

    this.logger.debug(`[CsvService] Importing CSV file: ${file.name}.`);
    const text = await file.text();

    const rows: Record<string, string>[] = [];
    parseString(text, { headers: true })
      .on("error", () => resolve(undefined))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows));

    const result = await promise;
    if (!result) {
      this.logger.warn(`[CsvService] Failed to import CSV file: ${file.name}.`);
      return undefined;
    }

    this.logger.debug(`[CsvService] Imported ${result.length} rows from CSV file: ${file.name}.`);

    return result;
  }

  async exportCsv(
    headers: Record<string, string>,
    data: Record<string, string | number>[],
  ): Promise<string | undefined> {
    const { promise, resolve } = Promise.withResolvers<string | undefined>();

    this.logger.debug(`[CsvService] Exporting ${data.length} rows to CSV file.`);

    const headerKeys = Object.keys(headers);
    const headerLabels = Object.values(headers);

    const rows = data.map((row) => headerKeys.map((key) => row[key] ?? ""));

    const chunks: string[] = [];
    const stream = format({ headers: headerLabels });

    stream.on("error", () => resolve(undefined));
    stream.on("data", (chunk: string) => {
      chunks.push(chunk);
    });
    stream.on("end", () => resolve(chunks.join("")));

    rows.forEach((row) => stream.write(row));
    stream.end();

    const result = await promise;
    if (!result) {
      this.logger.warn(`[CsvService] Failed to export CSV file.`);
      return undefined;
    }

    this.logger.debug(`[CsvService] Exported to CSV file.`);

    return result;
  }
}
