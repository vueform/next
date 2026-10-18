```ts
/**
 * Return type of `defineBindings`: the merged part-keyed bags computed plus
 * the registrar for component-level definitions.
 */
type DefineBindingsReturn<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = {
  /**
   * Merged part-keyed binding bags: the blueprint-provided base with
   * component-registered definitions layered on top.
   */
  bindings: ComputedRef<Record<string, any>>

  /**
   * Registers one or more binding definition objects or factories. Bags for
   * the same part shallow-merge on top of earlier layers; functional entries
   * replace the whole entry.
   *
   * @param defs Binding definition objects or factories.
   */
  useBindings: (...defs: BindingDefsArg<TApi, TPropRefs>[]) => void
}
```
