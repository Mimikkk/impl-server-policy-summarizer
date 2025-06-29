export const identity = <T>(value: T) => value;

export type Nil<T> = T | null | undefined;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
