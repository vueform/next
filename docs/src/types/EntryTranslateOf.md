```ts
/**
 * Resolves the `TTranslate` generic from a registry `TEntry` payload's
 * `translate` prop. Missing / invalid values fall back to `false` (the runtime
 * default); wide payloads (`any`) resolve to `boolean`.
 */
type EntryTranslateOf<TEntry> =
  EntryPropOf<TEntry, 'translate'> extends infer T
    ? T extends boolean
      ? T
      : false
    : false
```
