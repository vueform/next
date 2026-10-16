```ts
/**
 * The schema-entry surface for a registered element: its props (narrowed by
 * `TEntry` when provided) plus `on*` event-handler props derived from its
 * emits.
 */
type SchemaEntryOf<
  N extends ElementNames,
  TEntry = Record<string, any>,
> = ElementRegistry<TEntry>[N]['props'] &
  EmitsToProps<ElementRegistry<TEntry>[N]['emits']>
```
