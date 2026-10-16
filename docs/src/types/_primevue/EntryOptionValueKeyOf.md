```ts
/**
 * Resolves the `TOptionValueKey` generic from a registry `TEntry` payload's
 * `optionValue` prop — the string-key arm only (mapper returns are typed via
 * `EntryOptionValueReturnOf`). The PrimeVue-named counterpart of core
 * `EntryItemValueKeyOf`.
 */
type EntryOptionValueKeyOf<TEntry> = EntryItemValueKeyOf<OptionsEntry<TEntry>>
```
