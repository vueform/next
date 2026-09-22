```ts
/**
 * Public context for VfTreeSelect, optionally parameterized by concrete props
 * (e.g. `VfTreeSelectContext<VfTreeSelectProps<typeof options, 'checkbox'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfTreeSelectContext<
  TProps extends WidenProps<
    VfTreeSelectProps,
    TreeSelectProps<string, TreeOptionsProp, TreeSelectionModeProp>
  > = VfTreeSelectProps,
> extends DefineElementContext<
  TProps,
  VfTreeSelectEmits,
  VfTreeSelectSlots,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectExpose,
  TreeSelectApi<TProps>
> {}
```
