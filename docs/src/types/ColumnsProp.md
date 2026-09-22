```ts
/**
 * The full columns prop type, supporting plain values, breakpoint objects, or a
 * contextual function.
 *
 * @param context$ The element's component context.
 */
type ColumnsProp<TContext = any> =
  | ColumnsValue
  | BreakpointsColumns
  | ((context$: TContext) => ColumnsValue | BreakpointsColumns)
```
