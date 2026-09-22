```ts
/**
 * @write
 */
interface ValidationEmits<TContext = LooseContext> {
  /**
   * Emitted when the element becomes valid after having been invalid.
   *
   * @param context$ The element's component context.
   */
  valid: [context$: TContext]

  /**
   * Emitted when the element becomes invalid.
   *
   * @param context$ The element's component context.
   */
  invalid: [context$: TContext]
}
```
