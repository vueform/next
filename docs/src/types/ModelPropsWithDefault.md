```ts
/**
 * `ModelProps` plus a core-style `default` prop (same type as `modelValue`).
 */
interface ModelPropsWithDefault<T = any, TContext = any> extends ModelProps<
  T,
  TContext
> {
  /**
   * The default/initial value of the element. Being expressionable, a `{...}`
   * expression string is accepted alongside the model type.
   */
  default?: T | ExpressionString
}
```
