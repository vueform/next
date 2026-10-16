```ts
/**
 * Resolves a `TMultiple` generic from a registry `TEntry` payload's `multiple`
 * prop, defaulting to the component's runtime default when absent or invalid.
 */
type EntryMultipleOf<TEntry, TDefault extends boolean = false> =
  EntryPropOf<TEntry, 'multiple'> extends infer M
    ? M extends boolean
      ? M
      : TDefault
    : TDefault
```
