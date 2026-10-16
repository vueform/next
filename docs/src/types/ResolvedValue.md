```ts
/**
 * The computed's value type: the return override `V` when provided, otherwise
 * the value type unwrapped from the prop's declared type.
 */
type ResolvedValue<V, D> = [V] extends [void] ? UnwrapDynamicProp<D> : V
```
