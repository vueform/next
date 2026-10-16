```ts
/**
 * Raw option items for select, checkbox group, and radio elements, supporting
 * shorthand scalars and full objects. Arrays may be mutable or `readonly` / `as
 * const` tuples so literal unions can drive `modelValue` inference.
 */
type ItemsProp<TContext = any> =
  | Record<string, string | number>
  | readonly any[]
  | string
  | ((context$: TContext) => any)
```
