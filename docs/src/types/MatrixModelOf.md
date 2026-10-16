```ts
/**
 * The matrix model resolved from a registry `TEntry` payload's `rows` / `cols`
 * / `mode` props: dynamic matrices (numeric or absent `rows`) carry an array of
 * row values, static matrices key row values by their literal row values. Wide
 * / `any` entries stay permissive (`ObjectModel`).
 */
type MatrixModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'mode'>> extends true
    ? ObjectModel
    : MatrixRowOf<TEntry> extends infer Row
      ? IsDynamicMatrix<TEntry> extends true
        ? Row[]
        : [RowKeysOf<TEntry>] extends [never]
          ? Record<string, Row>
          : Prettify<{ [K in RowKeysOf<TEntry>]: Row }>
      : never
```
