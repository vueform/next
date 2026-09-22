```ts
/**
 * Responsive column definitions keyed by breakpoint name, excluding layout
 * section keys.
 */
type BreakpointsColumns = Record<string, ColumnsValue> & {
  [K in ColumnKeys]?: never
}
```
