import ky, { type KyInstance } from "ky";

interface ClientOptions {
  url: string;
}

export class Client {
  static new(options: ClientOptions) {
    return new Client(options.url, ky.create({ prefixUrl: options.url, throwHttpErrors: true }));
  }

  private constructor(
    private readonly url: string,
    public readonly api: KyInstance,
  ) {}

  urlOf(path: string): string {
    return `${this.url}/${path}`;
  }
}
