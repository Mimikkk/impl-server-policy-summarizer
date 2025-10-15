export class DefaultMap<K, V> extends Map<K, V> {
  static withInitializer<K, V>(initializer: () => V): DefaultMap<K, V> {
    return new DefaultMap(initializer);
  }

  private constructor(private readonly initializer: () => V) {
    super();
  }

  ensure(key: K): V {
    let value = super.get(key);

    if (value === undefined) {
      value = this.initializer();
      this.set(key, value);
      return value;
    }

    return value;
  }
}
