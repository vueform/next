```ts
/**
 * The string key used to read a row's value from object rows (`rowValue`,
 * defaulting to `'value'`).
 */
type RowValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'rowValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'
```
