```ts
/**
 * Resolves the `TItemValueKey` generic from a registry `TEntry` payload's
 * `itemValue` prop — the string-key arm only (mappers are typed via
 * `EntryItemValueReturnOf`).
 */
type EntryItemValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'itemValue'> extends infer IV
    ? [IV] extends [undefined]
      ? undefined
      : IV extends string
        ? IV
        : undefined
    : undefined
```
