```ts
/**
 * A text value that can be a plain string, a locale object, a ref, or a
 * contextual function.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 *
 * @param context$ The component context when used as a function.
 */
type TProp<T = string, TContext = any> =
  DProp<T, TContext> | Record<string, T | (string & {})>
```
