```ts
/**
 * Resolves the `TOptions` generic from a registry `TEntry` payload's `options`
 * prop — the PrimeVue-named counterpart of core `EntryItemsOf`.
 */
type EntryOptionsOf<TEntry> = EntryItemsOf<OptionsEntry<TEntry>>
```
