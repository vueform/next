```ts
/**
 * Base lifecycle events emitted by all Vueform components.
 */
interface BaseComponentEmits<TContext = LooseContext> {
  /**
   * Emitted before the component is mounted.
   *
   * @param context$ The component's context instance.
   */
  beforeMount: [context$: TContext]

  /**
   * Emitted after the component is mounted.
   *
   * @param context$ The component's context instance.
   */
  mounted: [context$: TContext]

  /**
   * Emitted before the component is unmounted.
   *
   * @param context$ The component's context instance.
   */
  beforeUnmount: [context$: TContext]

  /**
   * Emitted after the component is unmounted.
   *
   * @param context$ The component's context instance.
   */
  unmounted: [context$: TContext]

  /**
   * Emitted after the component is updated.
   *
   * @param context$ The component's context instance.
   */
  updated: [context$: TContext]
}
```
