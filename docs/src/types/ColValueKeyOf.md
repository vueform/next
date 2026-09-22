```ts
/**
 * The string key used to read a column's value from object cols (`colValue`,
 * defaulting to `'value'`). Function / `null` resolvers are not statically
 * resolvable and yield `never` (callers fall back to a wide shape).
 */
type ColValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'
```
