```ts
/**
 * Resolves the `TLanguages` generic from a registry `TEntry` payload's
 * `languages` prop, falling back to the wide `LanguagesProp` when absent — so
 * `translate: true` without `languages` yields a `string`-keyed model.
 */
type EntryLanguagesOf<TEntry> =
  EntryPropOf<TEntry, 'languages'> extends infer L
    ? L extends LanguagesProp
      ? L
      : LanguagesProp
    : LanguagesProp
```
