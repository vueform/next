```ts
/**
 * `TNullValue` fallback for a registry `TEntry` payload without a `nullValue`
 * prop: the text scalar when the entry translates (each language's entry),
 * `any` otherwise — an undeclared model shape stays unconstrained. Mirrors the
 * SFC's generic default.
 */
type EntryNullValueOf<TEntry> = EntryPropOr<
  TEntry,
  'nullValue',
  [EntryTranslateOf<TEntry>] extends [true] ? string | number | null : any
>
```
