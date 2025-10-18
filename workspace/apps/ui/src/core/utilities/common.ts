export const identity = <T>(value: T) => value;

export type Nil<T> = T | null | undefined;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.substring(1);
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const TimeMs = {
  s10: 10_000,
  s30: 30_000,
} as const;
