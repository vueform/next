```ts
/**
 * Public context for VfGrid, optionally parameterized by concrete props (e.g.
 * grid-schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfGridContext<
  TProps extends WidenProps<VfGridProps, GridProps<string>> = VfGridProps,
> extends DefineElementContext<
  TProps,
  VfGridEmits,
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridBindings,
  VfGridExpose,
  GridApi<TProps>
> {}
```
