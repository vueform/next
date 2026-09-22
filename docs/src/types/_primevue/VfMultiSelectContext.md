```ts
/**
 * Public context for VfMultiSelect, optionally parameterized by concrete props
 * (e.g. `VfMultiSelectContext<VfMultiSelectProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfMultiSelectContext<
  TProps extends WidenProps<
    VfMultiSelectProps,
    MultiSelectProps<
      string,
      OptionsProp,
      OptionValueProp,
      OptionGroupChildrenProp
    >
  > = VfMultiSelectProps,
> extends DefineElementContext<
  TProps,
  VfMultiSelectEmits,
  VfMultiSelectSlots,
  VfMultiSelectParts,
  VfMultiSelectClasses,
  VfMultiSelectExpose,
  MultiSelectApi<TProps>
> {}
```
