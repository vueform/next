```ts
/**
 * Whether the matrix carries an array model: numeric `rows`, or `rows` and
 * `endpoint` both absent — matching the runtime `dynamic` flag.
 */
type IsDynamicMatrix<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'rows'>> extends infer R
    ? [R] extends [undefined]
      ? EntryPropOf<TEntry, 'endpoint'> extends string
        ? false
        : true
      : R extends number
        ? true
        : false
    : true
```
