```ts
/**
 * Generic props interface for the VfTreeSelect component, parameterized by the
 * tree-option / selection-mode type arguments (e.g. `VfTreeSelectProps<typeof
 * options, 'checkbox'>`). Reach for `VfTreeSelectProps` instead when no
 * narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfTreeSelectProps<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectProps<
  'tree-select',
  TOptions,
  TSelectionMode,
  TModel,
  VfTreeSelectSlots<TOptions, TSelectionMode, TModel>,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
> {}
```
