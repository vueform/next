```ts
/**
 * Public context for VfGroup, optionally parameterized by concrete props (e.g.
 * schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfGroupContext<
  TProps extends WidenProps<VfGroupProps, GroupProps<string>> = VfGroupProps,
> extends DefineElementContext<
  TProps,
  VfGroupEmits,
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupExpose,
  GroupApi<TProps>
> {}
```
