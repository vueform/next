```ts
/**
 * Resolves the `TGroupChildren` generic from a registry `TEntry` payload's
 * `optionGroupChildren` prop, coerced to `TBound`. The PrimeVue-named
 * counterpart of core `EntryGroupChildrenOf`.
 *
 * Cascade-select elements pass `CascadeOptionGroupChildrenProp` as `TBound` to
 * also admit nested path arrays.
 */
type EntryOptionGroupChildrenOf<TEntry, TBound = OptionGroupChildrenProp> =
  EntryPropOf<TEntry, 'optionGroupChildren'> extends infer G
    ? G extends TBound
      ? G
      : undefined
    : undefined
```
