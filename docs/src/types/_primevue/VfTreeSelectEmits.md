```ts
/**
 * Events emitted by the VfTreeSelect component, parameterized by the
 * tree-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfTreeSelectSlots`. Plain usage
 * (`VfTreeSelectEmits`) keeps the context wide.
 */
interface VfTreeSelectEmits<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectEmits<
  VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
> {}
```
