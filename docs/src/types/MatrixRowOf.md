```ts
/**
 * The per-row model resolved from `cols` + `mode`: an object of cell values
 * (`auto`), an array of selected col values (`multiple`), or a single col value
 * (`single`).
 */
type MatrixRowOf<TEntry> =
  EntryModeOf<TEntry> extends infer M
    ? M extends 'single'
      ? ColSelectionOf<TEntry> | null
      : M extends 'multiple'
        ? ColSelectionOf<TEntry>[]
        : AutoRowOf<TEntry>
    : never
```
