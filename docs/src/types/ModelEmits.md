```ts
/**
 * @write
 */
interface ModelEmits<T = any, TContext = LooseContext> {
  /**
   * Emitted when the element value changes.
   *
   * @param newValue The new element value.
   * @param oldValue The previous element value.
   * @param context$ The component context.
   */
  change: [newValue: T, oldValue: T, context$: TContext]

  /**
   * Emitted to update the v-model binding.
   *
   * @param value The new model value.
   */
  'update:modelValue': [value: T]

  /**
   * Emitted when the element's value is loaded programmatically via the `load`
   * method.
   *
   * @param value The loaded model value.
   * @param context$ The element's component context.
   */
  load: [value: T, context$: TContext]

  /**
   * Emitted when the element is reset to its default value.
   *
   * @param context$ The element's component context.
   */
  reset: [context$: TContext]

  /**
   * Emitted when the element's value is cleared.
   *
   * @param context$ The element's component context.
   */
  clear: [context$: TContext]
}
```
