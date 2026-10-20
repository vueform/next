```ts
/**
 * The data events a `useModel` instance fires alongside the submission events.
 * The context argument is the instance's virtual form facade.
 */
interface ModelDataEmits<TContext = any> {
  /**
   * Fired when any model value changes, with the new and previous snapshots.
   *
   * @param newValue The new model data.
   * @param oldValue The previous model data.
   * @param context$ The instance's virtual form context.
   */
  change: [
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    context$: TContext,
  ]

  /**
   * Fired when the model is reset to its initial snapshot.
   *
   * @param context$ The instance's virtual form context.
   */
  reset: [context$: TContext]

  /**
   * Fired when the model is cleared to its null values.
   *
   * @param context$ The instance's virtual form context.
   */
  clear: [context$: TContext]

  /**
   * Fired when data is loaded via `load()`.
   *
   * @param value The loaded model value.
   * @param context$ The instance's virtual form context.
   */
  load: [value: any, context$: TContext]
}
```
