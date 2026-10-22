```ts
/**
 * Options for resolving a raw items source (plain data, endpoint URL, or
 * function) into loaded data.
 */
type UseItemsSourceOptions = {
  /**
   * Reactive props describing the items source and its loading behavior.
   */
  props: {
    /**
     * The raw items source: plain data, an endpoint URL string (supporting
     * expressions), or a (possibly async) function receiving the component
     * context.
     */
    items: MaybeRef<ItemsProp> | undefined

    /**
     * The source that triggers re-resolution of function-based items. Accepts
     * an array of element paths whose values are watched, a `Ref`, or a
     * function used as a watch getter.
     */
    itemsTrigger?: ConditionsTriggerProp

    /**
     * The debounce delay in milliseconds applied before re-resolving items when
     * an expression path or trigger source changes.
     */
    itemsDebounce?: number

    /**
     * Custom HTTP headers to include when loading items from an endpoint.
     */
    headers?: Record<string, string>

    /**
     * The HTTP method to use when loading items from an endpoint. Defaults to
     * `'GET'`.
     */
    method?: string

    /**
     * Transforms data received from an endpoint or function into the items
     * format before normalization.
     */
    transformItems?: (data: any) => any[] | Record<string, any>
  }

  /**
   * The expressionable prop key checked against the expression allow list when
   * the source is an endpoint URL. Defaults to `'items'`.
   */
  key?: string

  /**
   * Whether to resolve the source immediately on setup. Defaults to `true`.
   */
  immediate?: boolean
}
```
