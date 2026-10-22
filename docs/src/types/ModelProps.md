```ts
/**
 * Props for elements with a model value (`v-model`) and optional
 * submit/transform hooks. Use `ModelPropsWithDefault` when the element also has
 * a `default` prop — plain interfaces so Vue's SFC compiler can resolve
 * `extends` chains.
 */
interface ModelProps<T = any, TContext = any> {
  /**
   * The current value of the element (v-model).
   */
  modelValue?: T

  /**
   * Whether the element value is included in form submission data.
   */
  submit?: boolean

  /**
   * Whether the element holds sensitive data (passwords, payment details, …).
   * Sensitive values are excluded from locally stored drafts. On a
   * container, the whole subtree is excluded.
   */
  sensitive?: boolean

  /**
   * Transforms the element's value when submitting the form.
   *
   * @param value The raw value being submitted.
   * @param context$ The element's component context.
   */
  transformPayload?: (value: any, context$: TContext) => any
}
```
