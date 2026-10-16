```ts
/**
 * @write
 */
interface InteractionEmits<TContext = LooseContext> {
  /**
   * Emitted when the element receives focus.
   *
   * @param context$ The element's component context.
   */
  focus: [context$: TContext]

  /**
   * Emitted when the element loses focus.
   *
   * @param context$ The element's component context.
   */
  blur: [context$: TContext]
}
```
