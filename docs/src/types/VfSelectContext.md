```ts
/**
 * Public context for VfSelect, optionally parameterized by concrete props (e.g.
 * `VfSelectContext<VfSelectProps<typeof items, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfSelectContext<
  TProps extends WidenProps<
    VfSelectProps,
    SelectProps<string, ItemsProp, ItemValueProp, GroupChildrenProp>
  > = VfSelectProps,
> extends DefineElementContext<
  TProps,
  VfSelectEmits,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectExpose,
  SelectApi<TProps>
> {}
```
