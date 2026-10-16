```ts
/**
 * Resolves the `TSelectionMode` generic from a registry `TEntry` payload's
 * `selectionMode` prop, defaulting to `undefined` when absent or invalid.
 */
type EntrySelectionModeOf<TEntry> =
  EntryPropOf<TEntry, 'selectionMode'> extends infer M
    ? M extends DatePickerSelectionModeProp
      ? M
      : undefined
    : undefined
```
