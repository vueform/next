```ts
/**
 * Resolves a raw items source into loaded data: plain arrays and objects are
 * passed through, endpoint URL strings are fetched via HTTP, and (async)
 * functions are invoked with the component context.
 *
 * @param options Items source configuration object.
 */
function useItemsSource(options: UseItemsSourceOptions): {
  /**
   * Whether the items are currently being loaded from an endpoint or an async
   * function.
   */
  resolving: ShallowRef<boolean, boolean>

  /**
   * The raw items data before normalization (from props, endpoint, or
   * function).
   */
  resolvedItems:
    | ShallowRef<any[], any[]>
    | ShallowRef<Record<string, any>, Record<string, any>>

  /**
   * Resolves the items source: fetches endpoint URLs, invokes functions
   * (awaiting async results), and passes plain data through.
   */
  resolveItems: () => void
}
```
