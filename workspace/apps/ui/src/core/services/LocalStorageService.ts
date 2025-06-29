export namespace LocalStorageService {
  export const get = (key: string) => localStorage.getItem(key);

  export const set = (key: string, value: string | null) => {
    const oldValue = localStorage.getItem(key);

    if (oldValue === value) return;

    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }

    globalThis.dispatchEvent(LocalStorageEvent.create(key, oldValue, value));
  };

  export const remove = (key: string) => {
    const oldValue = localStorage.getItem(key);
    if (oldValue === null) return;

    localStorage.removeItem(key);

    globalThis.dispatchEvent(LocalStorageEvent.create(key, oldValue, null));
  };
}

export class LocalStorageEvent extends CustomEvent<{ key: string; oldValue: string | null; newValue: string | null }> {
  static create(key: string, oldValue: string | null, newValue: string | null) {
    return new LocalStorageEvent(key, oldValue, newValue);
  }

  constructor(key: string, oldValue: string | null, newValue: string | null) {
    super("local-storage", { detail: { key, oldValue, newValue } });
  }
}

declare global {
  interface WindowEventMap {
    "local-storage": LocalStorageEvent;
  }
}
