```ts
/**
 * Reads an optional prop from a registry `TEntry` payload with a fallback
 * default applied when the key is absent or `undefined`.
 *
 * `any` passes through unchanged (instead of collapsing to the default via
 * `[any] extends [undefined]`) so wide registry instantiations stay maximally
 * permissive.
 */
type EntryPropOr<TEntry, K extends PropertyKey, TDefault> =
  EntryPropOf<TEntry, K> extends infer V
    ? IsAny<V> extends true
      ? V
      : [V] extends [undefined]
        ? TDefault
        : V
    : TDefault
```
