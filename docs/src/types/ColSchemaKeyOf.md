```ts
/**
 * The string key used to read a column's custom element schema from object cols
 * (`colSchema`, defaulting to `'schema'`).
 */
type ColSchemaKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colSchema'> extends infer K
    ? [K] extends [undefined]
      ? 'schema'
      : K extends string
        ? K
        : never
    : 'schema'
```
