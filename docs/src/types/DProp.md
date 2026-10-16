```ts
/**
 * A prop value of type `T` that can also be provided as a plain string (e.g. an
 * expression) or a contextual function returning either.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 *
 * @param context$ The component context when used as a function.
 */
type DProp<T = string, TContext = any> =
  | T
  | (string & {})
  | Ref<T | (string & {})>
  | ((context$: TContext) => T | (string & {}))
  | undefined
```
