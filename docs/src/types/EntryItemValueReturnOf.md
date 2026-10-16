```ts
/**
 * Resolves the `TItemValueReturn` generic from a registry `TEntry` payload's
 * `itemValue` prop — the mapper-return arm (`unknown` = unset).
 */
type EntryItemValueReturnOf<TEntry> =
  EntryPropOf<TEntry, 'itemValue'> extends (...args: any) => infer R
    ? R
    : unknown
```
