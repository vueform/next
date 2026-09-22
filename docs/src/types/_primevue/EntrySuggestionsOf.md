```ts
/**
 * Resolves the `TSuggestions` generic from a registry `TEntry` payload's
 * `suggestions` prop — the AutoComplete counterpart of core `EntryItemsOf`.
 */
type EntrySuggestionsOf<TEntry> = EntryItemsOf<{
  items: EntryPropOf<TEntry, 'suggestions'>
}>
```
