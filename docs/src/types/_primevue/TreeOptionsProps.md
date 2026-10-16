```ts
/**
 * Props for PrimeVue tree-select-style elements (`options` only — no
 * `optionValue` / `optionLabel`). Model typing uses `TreeSelectModel`.
 */
interface TreeOptionsProps<TOptions extends TreeOptionsProp = TreeOptionsProp> {
  /**
   * The tree option items for the tree-select element. Accepts a static array
   * of tree nodes, an endpoint URL string, or a function returning tree nodes
   * (sync or async).
   */
  options?: MaybeRef<TOptions>

  /**
   * Custom HTTP headers to include when loading options from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading options from an endpoint. Defaults to
   * `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based options. Accepts
   * an array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based options are only
   * re-resolved when the `options` prop reference itself changes.
   */
  optionsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based options when the `optionsTrigger` source changes. Defaults
   * to no debounce (immediate re-resolution).
   */
  optionsDebounce?: number

  /**
   * Transforms data received from an endpoint into the tree node array format.
   * When `options` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   *
   * @param data The received from the endpoint.
   */
  transformOptions?: (data: any) => any[]
}
```
