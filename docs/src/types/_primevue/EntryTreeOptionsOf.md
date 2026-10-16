```ts
/**
 * Resolves the `TOptions` generic from a registry `TEntry` payload's `options`
 * prop. Missing / invalid values fall back to the unconstrained
 * `TreeOptionsProp`. Literal tree keys are preserved so `TreeSelectModel` can
 * narrow selection-key maps.
 */
type EntryTreeOptionsOf<TEntry> =
  EntryPropOf<TEntry, 'options'> extends infer I
    ? [I] extends [undefined]
      ? TreeOptionsProp
      : UnwrapEntryRef<I> extends infer U extends TreeOptionsProp
        ? U
        : TreeOptionsProp
    : TreeOptionsProp
```
