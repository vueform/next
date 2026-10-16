```ts
/**
 * Resolves the `TItems` generic from a registry `TEntry` payload's `items`
 * prop, widening const-narrowed literals via `WidenItems` (schema items do not
 * drive literal models). Missing / invalid values fall back to the
 * unconstrained `ItemsProp` (matching SFC generic defaults, so the model stays
 * wide).
 */
type EntryItemsOf<TEntry> =
  EntryPropOf<TEntry, 'items'> extends infer I
    ? [I] extends [undefined]
      ? ItemsProp
      : WidenItems<UnwrapEntryRef<I>> extends infer U extends ItemsProp
        ? U
        : ItemsProp
    : ItemsProp
```
