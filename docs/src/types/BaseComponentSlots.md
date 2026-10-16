```ts
/**
 * Base slots shared by all Vueform components.
 *
 * `TContext` defaults to `LooseContext` and is overridden by element /
 * component slot maps that pass a concrete context (see `VfSelectSlots`).
 */
interface BaseComponentSlots<TContext = LooseContext> {
  /**
   * Slot that replaces the entire component rendering. Receives the full
   * component context as a single `context` prop.
   *
   * @param scope The template slot's params.
   */
  template: (scope: {
    /**
     * The component context.
     */
    context: TContext
  }) => VNode[]
}
```
