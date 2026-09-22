```ts
/**
 * Resolves the `TOptionValueReturn` generic from a registry `TEntry` payload's
 * `optionValue` prop — the mapper-return arm (`unknown` = unset). The
 * PrimeVue-named counterpart of core `EntryItemValueReturnOf`.
 */
type EntryOptionValueReturnOf<TEntry> = EntryItemValueReturnOf<
  OptionsEntry<TEntry>
>
```
