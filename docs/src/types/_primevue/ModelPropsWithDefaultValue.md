```ts
/**
 * `ModelProps` plus a PrimeVue-style `defaultValue` prop (same type as
 * `modelValue`).
 */
interface ModelPropsWithDefaultValue<
  T = any,
  TContext = any,
> extends ModelProps<T, TContext> {
  /**
   * The default/initial value of the element.
   */
  defaultValue?: T
}
```
