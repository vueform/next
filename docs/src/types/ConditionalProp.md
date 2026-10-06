```ts
/**
 * The full conditions prop type accepted by component props, supporting raw or
 * negated conditions.
 *
 * `TContext` defaults to `any` for schema / blueprint use; component prop
 * interfaces specialize it (same pattern as event `context$`).
 */
type ConditionalProp<TContext = any> =
  | RawConditionsProp<TContext>
  | NegatedConditionsProp<TContext>
```
