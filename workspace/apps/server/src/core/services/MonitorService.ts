export class DefaultMap<K, V> extends Map<K, V> {
  static withInitializer<K, V>(fn: () => V): DefaultMap<K, V> {
    return new DefaultMap(fn);
  }

  private constructor(private readonly fn: () => V) {
    super();
  }

  override ensure(key: K): V {
    const value = super.get(key);

    if (!value) {
      const newValue = this.fn();
      this.set(key, newValue);
      return newValue;
    }

    return value;
  }
}
