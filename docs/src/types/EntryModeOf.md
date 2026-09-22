```ts
/**
 * The resolved selection mode from a registry `TEntry` payload — anything but
 * an explicit `'single'` / `'multiple'` resolves to `'auto'`, matching the
 * runtime resolution.
 */
type EntryModeOf<TEntry> =
  EntryPropOf<TEntry, 'mode'> extends infer M
    ? M extends 'single'
      ? 'single'
      : M extends 'multiple'
        ? 'multiple'
        : 'auto'
    : 'auto'
```
