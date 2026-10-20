```ts
/**
 * Public context for VfList, optionally parameterized by concrete props (e.g.
 * schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfListContext<
  TProps extends WidenProps<VfListProps, ListProps<string>> = VfListProps,
> extends DefineElementContext<
  TProps,
  VfListEmits,
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListBindings,
  VfListExpose,
  ListApi<TProps>
> {}
```
