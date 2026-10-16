```ts
/**
 * The literal row keys of a static matrix resolved from `rows` (scalar array,
 * record map, or object array via `rowValue`). Endpoint / function rows yield
 * `never` (callers fall back to a wide record).
 */
type RowKeysOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'rows'>> extends infer R
    ? R extends string | ((...args: any) => any)
      ? never
      : R extends readonly (infer E)[]
        ? E extends Record<string, any>
          ? RowValueKeyOf<TEntry> extends infer K
            ? K extends keyof E
              ? Extract<E[K], string | number>
              : never
            : never
          : Extract<E, string | number>
        : R extends Record<string, any>
          ? Extract<keyof R, string | number>
          : never
    : never
```
