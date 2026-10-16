```ts
/**
 * Props for the element's default/initial value (PrimeVue `defaultValue`
 * naming).
 *
 * @deprecated Use `ModelPropsWithDefaultValue` instead.
 */
type DefaultValueProps<T = any> = Pick<
  ModelPropsWithDefaultValue<T>,
  'defaultValue'
>
```
