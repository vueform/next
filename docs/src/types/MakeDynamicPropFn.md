```ts
/**
 * Factory function signature for resolving raw dynamic prop values into
 * computeds.
 */
type MakeDynamicPropFn = {
  /**
   * Resolves a raw dynamic prop value into an expression-aware computed.
   *
   * @param key The expression allow-list key.
   * @param prop The dynamic prop value or ref to resolve.
   * @param options Resolution options.
   */
  <V = any, T = any>(
    key: string,
    prop: MaybeRef<DProp<T> | undefined>,
    options?: UseDynamicPropOptions<V, T>
  ): ComputedRef<any>

  /**
   * Resolves an unknown prop value into an expression-aware computed.
   *
   * @param key The expression allow-list key.
   * @param prop The unknown prop value or ref to attempt to resolve.
   * @param options Resolution options.
   */
  (
    key: string,
    prop: MaybeRef<unknown>,
    options?: UseDynamicPropOptions
  ): ComputedRef<any>
}
```
